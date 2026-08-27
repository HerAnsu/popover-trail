import { describe, it, expect, vi } from 'vitest';
import { createSubscriptionsSlice } from './sliceSubscriptions';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('sliceSubscriptions module', () => {
  it('subscribes and unsubscribes event listeners', () => {
    const ctx = createMockSliceContext<unknown, unknown, string>({ floating: [], trail: [] });
    const subscriptions = createSubscriptionsSlice(ctx);
    const listener = vi.fn();

    const unsub = subscriptions.subscribeEvent(listener);
    expect(ctx.deps.eventListeners.has(listener)).toBe(true);

    unsub();
    expect(ctx.deps.eventListeners.has(listener)).toBe(false);
  });
});
