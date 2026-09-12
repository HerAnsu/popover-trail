import { describe, expect, it, vi } from 'vitest';
import { createResolverSlice } from './createResolverSlice';
import { createSliceTestHarness } from '../../../testing';

describe('createResolverSlice module', () => {
  const createHarness = (customCache?: Record<string, unknown>) => {
    const mockCache = new Map<string, unknown>(customCache ? Object.entries(customCache) : []);
    const cache = {
      get: (k: string) => mockCache.get(k),
      set: (k: string, v: unknown) => mockCache.set(k, v),
      has: (k: string) => mockCache.has(k),
      delete: (k: string) => mockCache.delete(k),
      clear: () => mockCache.clear(),
    };
    const resolvePopoverEntry = vi.fn();

    const harness = createSliceTestHarness(
      createResolverSlice,
      {
        floating: [],
        trail: [],
        ownerId: 'owner-1',
        context: { user: 'Alice' },
        cache,
        resolveData: vi.fn(async (k: string) => ({ id: k, title: `Resolved ${k}` })),
      },
      { cache, resolvePopoverEntry },
    );

    return { harness, mockCache, resolvePopoverEntry };
  };

  it('openRootWithResolver invokes pipeline, adds node to PopoverDAG and emits open_root', async () => {
    const { harness, resolvePopoverEntry } = createHarness();
    await harness.actions.openRootWithResolver('card-1');

    expect(resolvePopoverEntry).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'card-1', controllerKey: '__root__' }),
    );
    expect(harness.getDAG()?.hasNode('card-1')).toBe(true);
    expect(harness.emittedEvents).toContainEqual(
      expect.objectContaining({ type: 'open_root', key: 'card-1' }),
    );
  });

  it('openNestedWithResolver registers parent-child relationship in PopoverDAG', async () => {
    const { harness, resolvePopoverEntry } = createHarness();
    harness.setState({ trail: [{ key: 'card-1', isLoading: false, error: null }] });
    harness.getDAG()?.addNode('card-1');

    await harness.actions.openNestedWithResolver('card-2', 'card-1');

    expect(resolvePopoverEntry).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'card-2', parentKey: 'card-1', controllerKey: 'card-2' }),
    );
    expect(harness.getDAG()?.hasNode('card-2')).toBe(true);
    expect(harness.getDAG()?.getAncestors('card-2')).toContain('card-1');
  });

  it('prefetchPopover resolves via resolveData and populates cache', async () => {
    const { harness, mockCache } = createHarness();

    const result = await harness.actions.prefetchPopover('card-async');
    expect(result).toEqual({ id: 'card-async', title: 'Resolved card-async' });
    expect(mockCache.get('card-async')).toEqual({ id: 'card-async', title: 'Resolved card-async' });
  });

  it('invalidate removes keys from cache and retryPopover re-triggers resolve', async () => {
    const { harness, mockCache, resolvePopoverEntry } = createHarness({
      'card-1': { title: 'Old Data' },
    });

    await harness.actions.invalidate('card-1');
    expect(mockCache.get('card-1')).toBeUndefined();

    harness.setState({
      trail: [{ key: 'card-retry', isLoading: false, error: new Error('Network fail') }],
    });
    await harness.actions.retryPopover('card-retry');
    expect(resolvePopoverEntry).toHaveBeenCalledWith(
      expect.objectContaining({ key: 'card-retry' }),
    );
  });
});
