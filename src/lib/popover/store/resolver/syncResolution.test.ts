import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import { tryLaunchSyncResolver } from './syncResolver';

describe('resolver/syncResolver', () => {
  const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>;

  const makeDeps = () => {
    const safeSet = vi.fn<ResolverPipelineDependencies<unknown, unknown, string>['safeSet']>();
    const deps: ResolverPipelineDependencies<unknown, unknown, string> = {
      popoverDAG: undefined as never,
      resolveData: vi.fn(),
      inFlightPromises: new Map<string, Promise<unknown>>(),
      registerController: vi.fn(() => new AbortController()),
      removeController: vi.fn(),
      safeSet,
      findEntryByKey: () => undefined,
      eventListeners: undefined,
      eventBus: undefined,
    };
    return { deps, safeSet };
  };

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
