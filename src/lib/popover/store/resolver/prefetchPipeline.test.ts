import { describe, it, expect, vi } from 'vitest';
import type { StoreApi } from 'zustand/vanilla';
import type { StoreState } from '../../types';
import { prefetchPopoverData, retryPopoverResolution } from './prefetchPipeline';

describe('resolver/prefetchPipeline', () => {
  const createMockStore = (stateOverrides: Partial<StoreState<unknown, unknown, string>> = {}) => {
    const retryPopover = vi.fn().mockResolvedValue(undefined);
    const state: Partial<StoreState<unknown, unknown, string>> = {
      resolveData: vi.fn(async (key: string) => `data-for-${key}`),
      context: { user: 'tester' },
      trail: [],
      floating: [],
      retryPopover,
      ...stateOverrides,
    };

    const store: StoreApi<StoreState<unknown, unknown, string>> = {
      getState: () => state as StoreState<unknown, unknown, string>,
      setState: vi.fn(),
      subscribe: vi.fn(),
      getInitialState: () => state as StoreState<unknown, unknown, string>,
    };

    return { store, state, retryPopover };
  };

  it('prefetches data in background and passes context and parentData', async () => {
    const resolveData = vi.fn(async (key: string, parentData?: unknown, ctx?: unknown) => ({
      key,
      parentData,
      ctx,
    }));
    const { store } = createMockStore({ resolveData, context: { test: true } });

    const result = await prefetchPopoverData(store, 'item-1', { parentData: 'parent-payload' });

    expect(result).toEqual({
      key: 'item-1',
      parentData: 'parent-payload',
      ctx: { test: true },
    });
    expect(resolveData).toHaveBeenCalledTimes(1);
  });

  it('returns undefined if no resolver is configured', async () => {
    const { store } = createMockStore({ resolveData: undefined });
    const result = await prefetchPopoverData(store, 'any-key');
    expect(result).toBeUndefined();
  });

  it('swallows resolver errors silently during background prefetch', async () => {
    const failingResolver = vi.fn().mockRejectedValue(new Error('Network failure'));
    const { store } = createMockStore({ resolveData: failingResolver });

    const result = await prefetchPopoverData(store, 'fail-key');
    expect(result).toBeUndefined();
  });

  it('retryPopoverResolution delegates directly to store retryPopover method', async () => {
    const { store, retryPopover } = createMockStore();
    const mockEntry = { key: 'retry-k', isLoading: false, error: null } as never;

    await retryPopoverResolution(store, 'retry-k', mockEntry);
    expect(retryPopover).toHaveBeenCalledWith('retry-k');
  });
});
