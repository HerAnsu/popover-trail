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
});
