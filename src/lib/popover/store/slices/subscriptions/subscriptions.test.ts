import { describe, expect, it, vi } from 'vitest';
import { createSubscriptionsSlice } from './createSubscriptionsSlice';
import { createSliceTestHarness } from '../../../testing';
import type { PopoverStore } from '../../../types';

type TestStore = PopoverStore<unknown, unknown, string>;

describe('createSubscriptionsSlice module', () => {
  it('subscribes and unsubscribes event listeners to the store event bus', () => {
    const harness = createSliceTestHarness(createSubscriptionsSlice);
    const listener = vi.fn();

    const unsub = harness.actions.subscribeEvent(listener);
    expect(harness.context.deps.eventListeners.has(listener)).toBe(true);

    unsub();
    expect(harness.context.deps.eventListeners.has(listener)).toBe(false);
  });

  it('subscribes to specific key changes with shallow equality guard', () => {
    let subscriberCallback: ((state: TestStore, prevState: TestStore) => void) | undefined;
    const subscribeState = vi.fn((cb: (state: TestStore, prevState: TestStore) => void) => {
      subscriberCallback = cb;
      return vi.fn();
    });

    const harness = createSliceTestHarness(
      createSubscriptionsSlice,
      {
        floating: [],
        trail: [{ key: 'k1', isLoading: false, error: null, transitionStatus: 'mounted' }],
      },
      { subscribeState },
    );

    const keyListener = vi.fn();
    const unsub = harness.actions.subscribeKey('k1', keyListener);
    expect(subscribeState).toHaveBeenCalled();

    // Trigger state change with updated entry
    const prevState = harness.get();
    const nextState: TestStore = {
      ...prevState,
      trail: [{ key: 'k1', isLoading: false, error: null, transitionStatus: 'unmounting' }],
    };
    subscriberCallback?.(nextState, prevState);

    expect(keyListener).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'k1', transitionStatus: 'unmounting' }),
      expect.objectContaining({ key: 'k1', transitionStatus: 'mounted' }),
    );

    // Identical entry does not re-trigger listener (zero-allocation shallow guard)
    keyListener.mockClear();
    subscriberCallback?.(nextState, nextState);
    expect(keyListener).not.toHaveBeenCalled();

    unsub();
  });

  it('handles unmounted entries and missing subscribeState safely', () => {
    const noopHarness = createSliceTestHarness(
      createSubscriptionsSlice,
      {},
      { subscribeState: undefined },
    );

    const cleanup = noopHarness.actions.subscribeKey('k1', vi.fn());
    expect(typeof cleanup).toBe('function');
    expect(() => cleanup()).not.toThrow();

    // Empty key subscription
    const emptyCleanup = noopHarness.actions.subscribeKey('', vi.fn());
    expect(typeof emptyCleanup).toBe('function');
  });
});
