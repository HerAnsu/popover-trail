import { describe, it, expect } from 'vitest';
import { createInitialFSMState, transitionFSMState } from './fsmTransitions';
import type { PopoverFSMState } from './fsmTypes';

describe('fsmTransitions & createInitialFSMState', () => {
  it('initializes state with string key', () => {
    const state = createInitialFSMState('card-1');
    expect(state.value).toBe('Idle');
    expect(state.context.key).toBe('card-1');
  });

  it('initializes state with full options object', () => {
    const customErr = new Error('Init error');
    const state = createInitialFSMState({
      key: 'card-2',
      initialState: 'Resolved.Trailing',
      initialData: { role: 'admin' },
      initialError: customErr,
      initialContext: { pinnedPos: { top: 10, left: 20 } },
    });

    expect(state.value).toBe('Resolved.Trailing');
    expect(state.context.key).toBe('card-2');
    expect(state.context.data).toEqual({ role: 'admin' });
    expect(state.context.error).toBe(customErr);
    expect(state.context.pinnedPos).toEqual({ top: 10, left: 20 });
  });

  it('initializes Error state with fallback error if not provided', () => {
    const state = createInitialFSMState({
      key: 'card-err',
      initialState: 'Error',
    });
    expect(state.value).toBe('Error');
    expect(state.context.error?.message).toBe('Unknown FSM Error');
  });

  it('transitions from Idle to Hydrating on OPEN_ROOT or PUSH_NESTED', () => {
    const idle = createInitialFSMState('c1');
    const opened = transitionFSMState(idle, { type: 'OPEN_ROOT', key: 'c1' });
    expect(opened.value).toBe('Hydrating');

    const pushed = transitionFSMState(idle, { type: 'PUSH_NESTED', key: 'c1' });
    expect(pushed.value).toBe('Hydrating');
  });

  it('transitions from Hydrating to Resolved.Trailing or Error', () => {
    const hydrating: PopoverFSMState = { value: 'Hydrating', context: { key: 'c1' } };

    const resolved = transitionFSMState(hydrating, {
      type: 'RESOLVE_SUCCESS',
      data: { score: 100 },
    });
    expect(resolved.value).toBe('Resolved.Trailing');
    expect(resolved.context.data).toEqual({ score: 100 });

    const failed = transitionFSMState(hydrating, {
      type: 'RESOLVE_FAILURE',
      error: new Error('fetch error'),
    });
    expect(failed.value).toBe('Error');
    expect(failed.context.error?.message).toBe('fetch error');
  });

  it('handles TOGGLE_PIN between Trailing and Pinned', () => {
    const trailing: PopoverFSMState = {
      value: 'Resolved.Trailing',
      context: { key: 'c1' },
    };

    const pinned = transitionFSMState(trailing, {
      type: 'TOGGLE_PIN',
      rect: { top: 100, left: 200 },
    });
    expect(pinned.value).toBe('Resolved.Pinned');
    expect(pinned.context.pinnedPos).toEqual({ top: 100, left: 200 });

    const unpinned = transitionFSMState(pinned, { type: 'TOGGLE_PIN' });
    expect(unpinned.value).toBe('Resolved.Trailing');
    expect(unpinned.context.pinnedPos).toBeUndefined();
  });

  it('handles CLOSE, TRANSITION_END and RETRY cycles', () => {
    const trailing: PopoverFSMState = {
      value: 'Resolved.Trailing',
      context: { key: 'c1' },
    };

    const unmounting = transitionFSMState(trailing, { type: 'CLOSE' });
    expect(unmounting.value).toBe('Unmounting');

    const idle = transitionFSMState(unmounting, { type: 'TRANSITION_END' });
    expect(idle.value).toBe('Idle');

    const errState: PopoverFSMState = {
      value: 'Error',
      context: { key: 'c1', error: new Error('fail') },
    };
    const retried = transitionFSMState(errState, { type: 'RETRY' });
    expect(retried.value).toBe('Hydrating');
    expect(retried.context.error).toBeUndefined();
  });

  it('returns state unchanged on invalid transition', () => {
    const idle = createInitialFSMState('c1');
    const invalid = transitionFSMState(idle, {
      type: 'RESOLVE_SUCCESS',
      data: 123,
    });
    expect(invalid).toBe(idle);
  });
});
