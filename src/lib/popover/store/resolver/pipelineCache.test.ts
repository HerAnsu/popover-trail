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

  const makeCache = (data?: unknown): PopoverCache<unknown> =>
    ({
      get: vi.fn(() => data),
      set: vi.fn(),
      delete: vi.fn(),
    }) as unknown as PopoverCache<unknown>;

  const makeArgs = (overrides: Record<string, unknown> = {}) => {
    const safeSet = vi.fn();
    const insertStatePatch = vi.fn((entry) => ({ floating: [entry] }));
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
        insertStatePatch,
      },
      safeSet,
      buildEntry: vi.fn((data?: unknown) => makeEntry('k1', data)),
      eventListeners: undefined,
      eventBus: undefined,
      ...overrides,
    };
  };

  describe('getSyncCachedData', () => {
    it('returns undefined when no cache is configured', () => {
      expect(getSyncCachedData(undefined, 'k1')).toBeUndefined();
    });

    it('returns synchronous cache hits and skips promises', () => {
      expect(getSyncCachedData(makeCache(42), 'k1')).toBe(42);

      const promiseCache = makeCache(Promise.resolve(42));
      expect(getSyncCachedData(promiseCache, 'k1')).toBeUndefined();
    });
  });

  describe('tryResolveFromCacheOrState', () => {
    it('commits cached data through insertStatePatch and reports resolution', () => {
      const args = makeArgs({ cache: makeCache('cached') });
      const result = tryResolveFromCacheOrState(args);

      expect(result).toBe(true);
      expect(args.buildEntry).toHaveBeenCalledWith('cached', null, false);
      expect(args.safeSet).toHaveBeenCalledTimes(1);
    });

    it('skips commit when the request counter went stale', () => {
      const args = makeArgs({
        cache: makeCache('cached'),
        resolveParams: { isStale: () => true, insertStatePatch: vi.fn() },
      });
      const result = tryResolveFromCacheOrState(args);

      expect(result).toBe(true);
      expect(args.safeSet).not.toHaveBeenCalled();
    });

    it('reuses an existing hydrated success entry without forceRefresh', () => {
      const args = makeArgs({ existingEntry: makeEntry('k1', 'existing') });
      const result = tryResolveFromCacheOrState(args);

      expect(result).toBe(true);
      expect(args.safeSet).toHaveBeenCalledTimes(1);
    });

    it('ignores existing entries under forceRefresh and misses through', () => {
      const args = makeArgs({
        existingEntry: makeEntry('k1', 'existing'),
        forceRefresh: true,
      });
      expect(tryResolveFromCacheOrState(args)).toBe(false);
      expect(args.safeSet).not.toHaveBeenCalled();
    });

    it('returns false on a full miss without dispatching anything', () => {
      const args = makeArgs();
      expect(tryResolveFromCacheOrState(args)).toBe(false);
      expect(args.safeSet).not.toHaveBeenCalled();
    });
  });
});
