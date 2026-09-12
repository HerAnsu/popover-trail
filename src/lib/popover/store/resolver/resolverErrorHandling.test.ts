import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import { handleResolverError } from './resolverResultHandler';

describe('resolver/resolverErrorHandling', () => {
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

  it('patches the matching entry with error state', () => {
    const { deps, safeSet } = makeDeps();
    handleResolverError(new Error('boom'), 'k1', deps);

    expect(safeSet).toHaveBeenCalledTimes(1);
    const firstCall = safeSet.mock.calls[0]?.[0];
    expect(firstCall).toBeDefined();
    const patchFactory = firstCall as (state: unknown) => unknown;
    const patch = patchFactory({ floating: [makeEntry('k1')], trail: [] });
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
