import { describe, it, expect, vi } from 'vitest';
import type { PopoverCache, TrailEntry } from '../../types';
import { getSyncCachedData, tryResolveFromCacheOrState } from './pipelineCache';

describe('resolver/pipelineCache', () => {
  const makeEntry = (key: string, data?: unknown): TrailEntry<unknown, string> =>
    ({
      key,
      isLoading: false,
      error: null,
      ...(data !== undefined ? { data, status: 'success' as const } : {}),
    }) as TrailEntry<unknown, string>;

  const makeCache = (data?: unknown): PopoverCache<unknown> => ({
    get: vi.fn(() => data),
    set: vi.fn(),
    has: vi.fn(() => data !== undefined),
    delete: vi.fn(),
    clear: vi.fn(),
  });

  const makeArgs = (overrides: Record<string, unknown> = {}) => {
    const safeSet = vi.fn();
    return {
      cache: undefined,
      storeCache: undefined,
      existingEntry: undefined,
      key: 'k1',
      forceRefresh: false,
      requestCounter: 1,
      resolveParams: {
        key: 'k1',
        controllerKey: '__root__',
        incrementCounter: () => 1,
        isStale: vi.fn(() => false),
        insertStatePatch: vi.fn((e) => ({ floating: [e] })),
      },
      safeSet,
      buildEntry: vi.fn((data?: unknown) => makeEntry('k1', data)),
      eventListeners: undefined,
      eventBus: undefined,
      ...overrides,
    };
  };

  it('reads synchronous cache hits and ignores undefined or promises in getSyncCachedData', () => {
    expect(getSyncCachedData(undefined, 'k1')).toBeUndefined();
    expect(getSyncCachedData(makeCache(42), 'k1')).toBe(42);
    expect(getSyncCachedData(makeCache(Promise.resolve(42)), 'k1')).toBeUndefined();
  });

  it('commits cached data through insertStatePatch and reports resolution', () => {
    const args = makeArgs({ cache: makeCache('cached') });
    expect(tryResolveFromCacheOrState(args)).toBe(true);
    expect(args.buildEntry).toHaveBeenCalledWith('cached', null, false);
    expect(args.safeSet).toHaveBeenCalledTimes(1);
  });

  it('skips commit when the request counter went stale', () => {
    const args = makeArgs({
      cache: makeCache('cached'),
      resolveParams: { isStale: () => true, insertStatePatch: vi.fn() },
    });
    expect(tryResolveFromCacheOrState(args)).toBe(true);
    expect(args.safeSet).not.toHaveBeenCalled();
  });

  it('reuses existing hydrated success entry without forceRefresh and misses under forceRefresh', () => {
    const args = makeArgs({ existingEntry: makeEntry('k1', 'existing') });
    expect(tryResolveFromCacheOrState(args)).toBe(true);
    expect(args.safeSet).toHaveBeenCalledTimes(1);

    const refreshed = makeArgs({ existingEntry: makeEntry('k1', 'existing'), forceRefresh: true });
    expect(tryResolveFromCacheOrState(refreshed)).toBe(false);
  });

  it('returns false on a full miss without dispatching anything', () => {
    const args = makeArgs();
    expect(tryResolveFromCacheOrState(args)).toBe(false);
    expect(args.safeSet).not.toHaveBeenCalled();
  });
});
