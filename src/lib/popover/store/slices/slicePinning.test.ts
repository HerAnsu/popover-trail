import { describe, it, expect, vi } from 'vitest';
import { createPinningSlice } from './slicePinning';
import { SliceContext } from './sliceContext';
import { PopoverStateData, TrailEntry } from '../../types';

describe('slicePinning module', () => {
  const createMockContext = () => {
    let state = {
      floating: [],
      trail: [{ key: 'card-1', isLoading: false, error: null } as TrailEntry<unknown>],
      offsets: {},
      pinnedStates: { 'card-1': false },
      zIndexOrder: ['card-1'],
      nestedHydrationRequestCounters: {},
    } as unknown as PopoverStateData<unknown, unknown>;

    const pushSnapshot = vi.fn();
    const clearHoverTimer = vi.fn();

    const ctx: SliceContext<unknown, unknown, string> = {
      get: () => state,
      set: (patch) => {
        const next = typeof patch === 'function' ? patch(state) : patch;
        state = { ...state, ...next };
      },
      deps: {
        pushSnapshot,
        clearHoverTimer,
        findEntryByKey: (key: string) => state.trail.find((e) => e.key === key),
      } as unknown,
    };

    return { ctx, pushSnapshot, clearHoverTimer, getState: () => state };
  };

  it('toggles pin state and invokes clearHoverTimer and pushSnapshot', () => {
    const { ctx, pushSnapshot, clearHoverTimer, getState } = createMockContext();
    const pinning = createPinningSlice(ctx);

    pinning.togglePin('card-1');

    expect(pushSnapshot).toHaveBeenCalled();
    expect(clearHoverTimer).toHaveBeenCalledWith('card-1');
    expect(getState().floating).toHaveLength(1);
    expect(getState().pinnedStates['card-1']).toBe(true);
  });

  it('updates offset for pinned card avoiding NaN values', () => {
    const { ctx, getState } = createMockContext();
    const pinning = createPinningSlice(ctx);

    pinning.updateOffset('card-1', Number.NaN, 50);
    expect(getState().offsets['card-1']).toBeUndefined();

    pinning.updateOffset('card-1', 10, 20);
    expect(getState().offsets['card-1']).toEqual({ x: 10, y: 20 });
  });

  it('elevates card zIndexOrder on bringToFront', () => {
    const { ctx, getState } = createMockContext();
    ctx.set({
      trail: [
        { key: 'card-1', isLoading: false, error: null } as TrailEntry<unknown>,
        { key: 'card-2', isLoading: false, error: null } as TrailEntry<unknown>,
      ],
      zIndexOrder: ['card-1', 'card-2'],
    });

    const pinning = createPinningSlice(ctx);
    pinning.bringToFront('card-1');

    expect(getState().zIndexOrder).toEqual(['card-2', 'card-1']);
  });

  it('updates offset when coordinates are valid numeric values', () => {
    const { ctx, getState } = createMockContext();
    const pinning = createPinningSlice(ctx);

    pinning.updateOffset('card-1', 40, 50);
    expect(getState().offsets['card-1']).toEqual({ x: 40, y: 50 });
  });
});
