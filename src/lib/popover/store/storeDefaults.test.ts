import { describe, it, expect, vi } from 'vitest';
import { getInitialStoreState } from './storeDefaults';

describe('storeDefaults module', () => {
  it('returns clean initial store state dictionary', () => {
    const resolver = vi.fn(async () => ({}));
    const state = getInitialStoreState(resolver, { env: 'prod' });

    expect(state.trail).toEqual([]);
    expect(state.floating).toEqual([]);
    expect(state.ownerId).toBeNull();
    expect(state.context).toEqual({ env: 'prod' });
    expect(state.baseZIndex).toBe(1000);
    expect(state.resolveData).toBe(resolver);
    expect(state.closePinnedDescendants).toBe(false);
  });
});
