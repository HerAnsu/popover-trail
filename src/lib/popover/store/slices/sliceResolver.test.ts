import { describe, it, expect, vi } from 'vitest';
import { createResolverSlice } from './sliceResolver';
import { SliceContext } from './sliceContext';
import { PopoverStateData, TrailEntry } from '../../types';

describe('sliceResolver module', () => {
  const createMockContext = () => {
    let state = {
      floating: [],
      trail: [{ key: 'root-1', isLoading: false, error: null } as TrailEntry<unknown>],
      ownerId: 'owner-1',
      resolveData: vi.fn(async () => ({ title: 'Prefetched Data' })),
      context: { theme: 'dark' },
      zIndexOrder: ['root-1'],
    } as unknown as PopoverStateData<unknown, unknown>;

    const activeControllers = new Map<string, AbortController>();
    const resolvePopoverEntry = vi.fn();
    const findEntryByKey = (key: string) => state.trail.find((e) => e.key === key);

    const ctx: SliceContext<unknown, unknown, string> = {
      get: () => state,
      set: (patch) => {
        const next = typeof patch === 'function' ? patch(state) : patch;
        state = { ...state, ...next };
      },
      deps: {
        activeControllers,
        incrementRootCounter: vi.fn(),
        isRootStale: vi.fn(() => false),
        incrementNestedCounter: vi.fn(),
        isNestedStale: vi.fn(() => false),
        findEntryByKey,
        resolvePopoverEntry,
        cache: new Map(),
      } as unknown,
    };

    return { ctx, resolvePopoverEntry, getState: () => state };
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
});
