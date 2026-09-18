import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import { awaitInFlightResolution } from './awaitResolution';
import { startInFlightResolver } from './inFlightLauncher';
import { runTracked } from '../storeControllers';
import { deferred } from '../../utils/asyncUtils';

describe('resolver/inFlightResolution', () => {
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

    expect(safeSet).toHaveBeenCalledTimes(1);
  });

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
    );

    expect(launch).toEqual({ isSync: false, hasError: false });
    expect(deps.inFlightPromises.has('k1')).toBe(true);

    await slow;
    await Promise.resolve();
    expect(deps.inFlightPromises.has('k1')).toBe(false);
  });

  it('keeps a newer promise registered when an older one settles late', async () => {
    const map = new Map<string, Promise<number>>();

    const d1 = deferred<number>();
    const first = runTracked(map, 'k', () => d1.promise);

    const d2 = deferred<number>();
    const second = runTracked(map, 'k', () => d2.promise);

    expect(map.get('k')).toBe(second);

    d1.resolve(1);
    await first;
    expect(map.has('k')).toBe(true);

    d2.resolve(2);
    await second;
    expect(map.has('k')).toBe(false);
  });
});
