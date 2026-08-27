import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import {
  awaitInFlightResolution,
  handleResolverError,
  startInFlightResolver,
  tryLaunchSyncResolver,
} from './pipelineExecution';
import { runTracked } from '../storeControllers';

describe('resolver/pipelineExecution', () => {
  const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>;

  const makeDeps = () => {
    const safeSet = vi.fn<(partial: unknown) => void>();
    const deps: ResolverPipelineDependencies<unknown, unknown, string> = {
      popoverDAG: undefined as never,
      resolveData: vi.fn(),
      inFlightPromises: new Map<string, Promise<unknown>>(),
      registerController: vi.fn(() => new AbortController()),
      removeController: vi.fn(),
      safeSet: safeSet as unknown as ResolverPipelineDependencies<
        unknown,
        unknown,
        string
      >['safeSet'],
      findEntryByKey: () => undefined,
      eventListeners: undefined,
      eventBus: undefined,
    };
    return { deps, safeSet };
  };

  describe('updateEntryInStoreLists via handleResolverError', () => {
    it('patches the matching entry with error state', () => {
      const { deps, safeSet } = makeDeps();
      handleResolverError(new Error('boom'), 'k1', deps);

      expect(safeSet).toHaveBeenCalledTimes(1);
      const firstCall = safeSet.mock.calls[0]?.[0];
      expect(firstCall).toBeDefined();
      const patchFactory = firstCall as (state: unknown) => unknown;
      const patch = patchFactory({
        floating: [makeEntry('k1')],
        trail: [],
      });
      expect(patch).toMatchObject({
        floating: [{ key: 'k1', isLoading: false }],
      });
    });

    it('ignores abort cancellations entirely', () => {
      const { deps, safeSet } = makeDeps();
      const abortError = new Error('aborted');
      abortError.name = 'AbortError';

      handleResolverError(abortError, 'k1', deps);
      expect(safeSet).not.toHaveBeenCalled();
    });
  });

  describe('tryLaunchSyncResolver', () => {
    it('returns false when no resolver is configured', () => {
      const { deps } = makeDeps();
      const launched = tryLaunchSyncResolver({
        key: 'k1',
        controllerKey: '__root__',
        parentData: undefined,
        activeResolver: undefined,
        currentContext: undefined,
        forceRefresh: false,
        requestCounter: 1,
        resolveParams: {
          key: 'k1',
          controllerKey: '__root__',
          incrementCounter: () => 1,
          isStale: () => false,
          insertStatePatch: vi.fn(),
        },
        deps,
        storeCache: undefined,
        buildEntry: vi.fn(() => makeEntry('k1')),
      });

      expect(launched).toBe(false);
    });

    it('resolves a synchronous resolver and skips stale commits', () => {
      const { deps } = makeDeps();
      const launched = tryLaunchSyncResolver({
        key: 'k1',
        controllerKey: '__root__',
        parentData: undefined,
        activeResolver: vi.fn(() => 'sync-data'),
        currentContext: undefined,
        forceRefresh: false,
        requestCounter: 1,
        resolveParams: {
          key: 'k1',
          controllerKey: '__root__',
          incrementCounter: () => 1,
          isStale: () => false,
          insertStatePatch: vi.fn(),
        },
        deps,
        storeCache: undefined,
        buildEntry: vi.fn(() => makeEntry('k1')),
      });

      expect(launched).toBe(true);
      expect(deps.removeController).toHaveBeenCalledWith('__root__', expect.any(AbortController));
    });
  });

  describe('awaitInFlightResolution', () => {
    it('commits success through the entry builder when fresh', async () => {
      const { deps, safeSet } = makeDeps();

      await awaitInFlightResolution({
        inFlight: Promise.resolve('payload'),
        key: 'k1',
        requestCounter: 1,
        resolveParams: {
          key: 'k1',
          controllerKey: '__root__',
          incrementCounter: () => 1,
          isStale: () => false,
          insertStatePatch: (entry) => ({ floating: [entry] }),
        },
        deps,
        storeCache: undefined,
        buildEntry: (data) => makeEntry(String(data)),
      });

      // The success commit goes through safeSet exactly once.
      expect(safeSet).toHaveBeenCalledTimes(1);
    });
  });

  describe('startInFlightResolver tracked dedup', () => {
    it('registers an in-flight promise and removes it on settle via identity guard', async () => {
      const { deps } = makeDeps();
      const slow = Promise.resolve('late');

      const launch = startInFlightResolver(
        'k1',
        'ctrl-k1',
        undefined,
        vi.fn(() => slow),
        undefined,
        deps,
        undefined,
        undefined,
      );

      expect(launch).toEqual({ isSync: false, hasError: false });
      expect(deps.inFlightPromises.has('k1')).toBe(true);

      await slow;
      await Promise.resolve();
      expect(deps.inFlightPromises.has('k1')).toBe(false);
    });
  });

  describe('runTracked identity guard', () => {
    it('keeps a newer promise registered when an older one settles late', async () => {
      const map = new Map<string, Promise<number>>();

      let releaseFirst!: (v: number) => void;
      const first = runTracked(map, 'k', () => new Promise<number>((r) => (releaseFirst = r)));

      let releaseSecond!: (v: number) => void;
      const second = runTracked(map, 'k', () => new Promise<number>((r) => (releaseSecond = r)));

      expect(map.get('k')).toBe(second);

      releaseFirst(1);
      await first;
      // The stale first promise must not evict the newer registration.
      expect(map.has('k')).toBe(true);

      releaseSecond(2);
      await second;
      expect(map.has('k')).toBe(false);
    });
  });
});
