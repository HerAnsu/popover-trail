import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import { awaitInFlightResolution, tryLaunchSyncResolver } from './pipelineExecution';

describe('resolver/executionSuccess', () => {
  const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: false, error: null }) as TrailEntry<unknown, string>;

  const makeDeps = () => {
    const safeSet = vi.fn();
    const deps: ResolverPipelineDependencies<unknown, unknown, string> = {
      popoverDAG: undefined as never,
      resolveData: vi.fn(),
      inFlightPromises: new Map<string, Promise<unknown>>(),
      registerController: vi.fn(() => new AbortController()),
      removeController: vi.fn(),
      safeSet: safeSet as never,
      findEntryByKey: () => undefined,
      eventListeners: undefined,
      eventBus: undefined,
    };
    return { deps, safeSet };
  };

  it('launches synchronous resolver and removes controller on settlement', () => {
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

  it('commits async resolution success through safeSet when not stale', async () => {
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

    expect(safeSet).toHaveBeenCalledTimes(1);
  });
});
