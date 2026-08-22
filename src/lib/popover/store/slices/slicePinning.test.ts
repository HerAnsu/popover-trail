import { describe, it, expect, vi } from 'vitest';
import { createPinningSlice } from './slicePinning';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('slicePinning module', () => {
  const createMockContext = () => {
    const pushSnapshot = vi.fn();

    const ctx = createMockSliceContext<unknown, unknown, string>(
      {
        floating: [],
        trail: [{ key: 'card-1', isLoading: false, error: null }],
        offsets: {},
        pinnedStates: { 'card-1': false },
        zIndexOrder: ['card-1'],
        nestedHydrationRequestCounters: {},
      },
      {
        pushSnapshot,
      },
    );

    const cancelHoverSpy = vi.spyOn(ctx.deps.transitionScheduler, 'cancelHover');

    return { ctx, pushSnapshot, cancelHoverSpy, getState: () => ctx.state };
  };

  it('toggles pin state and invokes transitionScheduler.cancelHover and pushSnapshot', () => {
    const { ctx, pushSnapshot, cancelHoverSpy, getState } = createMockContext();
    const pinning = createPinningSlice(ctx);

    pinning.togglePin('card-1');

    expect(pushSnapshot).toHaveBeenCalled();
    expect(cancelHoverSpy).toHaveBeenCalledWith('card-1');
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
        { key: 'card-1', isLoading: false, error: null },
        { key: 'card-2', isLoading: false, error: null },
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

  it('preserves logical hierarchy in PopoverDAG when toggling pin', () => {
    const { ctx } = createMockContext();
    ctx.deps.popoverDAG?.addNode('card-root');
    ctx.deps.popoverDAG?.addNode('card-child', 'card-root');
    ctx.state = {
      ...ctx.state,
      trail: [
        { key: 'card-root', isLoading: false, error: null },
        { key: 'card-child', parentKey: 'card-root', isLoading: false, error: null },
      ],
      zIndexOrder: ['card-root', 'card-child'],
    };

    const pinning = createPinningSlice(ctx);
    pinning.togglePin('card-child');

    expect(ctx.deps.popoverDAG?.getNode('card-child')?.parentKey).toBe('card-root');
    expect(ctx.deps.popoverDAG?.getDescendantKeys('card-root').has('card-child')).toBe(true);
  });

  it('elevates child nodes when parent is topmost in bringToFront', () => {
    const { ctx, getState } = createMockContext();
    ctx.deps.popoverDAG?.addNode('card-parent');
    ctx.deps.popoverDAG?.addNode('card-child', 'card-parent');
    ctx.set({
      trail: [
        { key: 'card-parent', isLoading: false, error: null },
        { key: 'card-other', isLoading: false, error: null },
        { key: 'card-child', parentKey: 'card-parent', isLoading: false, error: null },
      ],
      zIndexOrder: ['card-child', 'card-other', 'card-parent'],
    });

    const pinning = createPinningSlice(ctx);
    pinning.bringToFront('card-parent');

    // Both parent and its child should be moved to topmost
    expect(getState().zIndexOrder.slice(-2)).toEqual(['card-parent', 'card-child']);
  });
});
