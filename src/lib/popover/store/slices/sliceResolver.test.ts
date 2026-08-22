import { describe, it, expect, vi } from 'vitest';
import { createResolverSlice } from './sliceResolver';
import { SimplePopoverCache } from '../../utils/cache';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('sliceResolver module', () => {
  const createMockContext = () => {
    const resolvePopoverEntry = vi.fn(async () => {});
    const activeControllers = new Map<string, AbortController>();
    const cache = new SimplePopoverCache();

    const ctx = createMockSliceContext<unknown, { theme: string }, string>(
      {
        floating: [],
        trail: [{ key: 'root-1', isLoading: false, error: null }],
        ownerId: 'owner-1',
        resolveData: vi.fn(async () => ({ title: 'Prefetched Data' })),
        context: { theme: 'dark' },
        zIndexOrder: ['root-1'],
      },
      {
        activeControllers,
        resolvePopoverEntry,
        cache,
        incrementRootCounter: vi.fn(() => 1),
        isRootStale: vi.fn(() => false),
        incrementNestedCounter: vi.fn(() => 1),
        isNestedStale: vi.fn(() => false),
      },
    );

    return { ctx, resolvePopoverEntry, getState: () => ctx.state };
  };

  it('invokes resolvePopoverEntry when opening root with resolver', async () => {
    const { ctx, resolvePopoverEntry } = createMockContext();
    const resolverSlice = createResolverSlice(ctx);

    await resolverSlice.openRootWithResolver('card-2');
    expect(resolvePopoverEntry).toHaveBeenCalled();
  });

  it('prefetches popover data via background resolver', async () => {
    const { ctx } = createMockContext();
    const resolverSlice = createResolverSlice(ctx);

    const data = await resolverSlice.prefetchPopover('card-2');
    expect(data).toEqual({ title: 'Prefetched Data' });
  });

  it('retries popover data resolution via retryPopover slice method', async () => {
    const { ctx, resolvePopoverEntry } = createMockContext();
    const resolverSlice = createResolverSlice(ctx);

    await resolverSlice.retryPopover('root-1');
    expect(resolvePopoverEntry).toHaveBeenCalled();
  });

  it('invalidates cache and re-resolves active popovers on screen', async () => {
    const cache = new SimplePopoverCache();
    cache.set('root-1', { title: 'Old Cached Data' });

    const { ctx, resolvePopoverEntry } = createMockContext();
    ctx.deps.cache = cache;

    const resolverSlice = createResolverSlice(ctx);

    expect(cache.has('root-1')).toBe(true);

    await resolverSlice.invalidate('root-1');

    expect(cache.has('root-1')).toBe(false);
    expect(resolvePopoverEntry).toHaveBeenCalled();
  });

  it('returns undefined without throwing when prefetch is aborted', async () => {
    const { ctx } = createMockContext();
    const abortError = new Error('The operation was aborted');
    abortError.name = 'AbortError';
    vi.spyOn(ctx.state, 'resolveData').mockImplementation(async () => {
      throw abortError;
    });

    const resolverSlice = createResolverSlice(ctx);
    const result = await resolverSlice.prefetchPopover('card-aborted');
    expect(result).toBeUndefined();
  });

  it('deduplicates concurrent prefetch calls for the same key', async () => {
    const { ctx } = createMockContext();
    const resolverSpy = vi.fn(async () => {
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { count: 1 };
    });
    ctx.state = { ...ctx.state, resolveData: resolverSpy };

    const resolverSlice = createResolverSlice(ctx);
    const [res1, res2] = await Promise.all([
      resolverSlice.prefetchPopover('card-concurrent'),
      resolverSlice.prefetchPopover('card-concurrent'),
    ]);

    expect(res1).toEqual({ count: 1 });
    expect(res2).toEqual({ count: 1 });
    expect(resolverSpy).toHaveBeenCalledTimes(1);
  });

  it('aborts active controllers and cancels transition timers when opening root with different ownerId', async () => {
    const { ctx } = createMockContext();
    const abortSpy = vi.fn();
    ctx.deps.abortControllersForKeys = abortSpy;
    const cancelTimersSpy = vi.spyOn(ctx.deps.transitionScheduler, 'cancelAllForKeys');

    ctx.state = {
      ...ctx.state,
      ownerId: 'owner-old',
      trail: [{ key: 'root-old', isLoading: false, error: null }],
    };

    const resolverSlice = createResolverSlice(ctx);
    await resolverSlice.openRootWithResolver('root-new', undefined, { ownerId: 'owner-new' });

    expect(abortSpy).toHaveBeenCalledWith(['root-old']);
    expect(cancelTimersSpy).toHaveBeenCalledWith(['root-old']);
  });

  it('brings already pinned floating card to front instead of re-resolving', async () => {
    const { ctx, resolvePopoverEntry } = createMockContext();
    ctx.state = {
      ...ctx.state,
      floating: [
        { key: 'pinned-card', isLoading: false, error: null, transitionStatus: 'mounted' },
      ],
      zIndexOrder: ['root-1', 'pinned-card'],
    };

    const resolverSlice = createResolverSlice(ctx);
    await resolverSlice.openRootWithResolver('pinned-card');

    expect(resolvePopoverEntry).not.toHaveBeenCalled();
    expect(ctx.state.zIndexOrder.at(-1)).toBe('pinned-card');
  });
});
