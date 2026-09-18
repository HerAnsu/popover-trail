import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import type { ResolverPipelineDependencies } from './resolverTypes';
import { handleResolverError } from './resolverResultHandler';
import { invokeResolver } from './resolverArity';

describe('resolver/executionErrors', () => {
  const makeEntry = (key: string): TrailEntry<unknown, string> =>
    ({ key, isLoading: true, error: null }) as TrailEntry<unknown, string>;

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

  it('patches matching entry in store lists with error state on failure', () => {
    const { deps, safeSet } = makeDeps();
    handleResolverError(new Error('boom'), 'k1', deps);

    expect(safeSet).toHaveBeenCalledTimes(1);
    const patchFactory = safeSet.mock.calls[0]?.[0] as (state: unknown) => unknown;
    const patch = patchFactory({ floating: [makeEntry('k1')], trail: [] });
    expect(patch).toMatchObject({ floating: [{ key: 'k1', isLoading: false }] });
  });

  it('ignores abort cancellations without updating error state', () => {
    const { deps, safeSet } = makeDeps();
    const abortError = new Error('aborted');
    abortError.name = 'AbortError';

    handleResolverError(abortError, 'k1', deps);
    expect(safeSet).not.toHaveBeenCalled();
  });

  it('supports positional and object arity conventions and handles destructuring mismatch', () => {
    const ctrl = new AbortController();
    const positional = vi.fn((key: string) => `pos-${key}`);
    expect(invokeResolver(positional, 'k1', null, undefined, ctrl.signal)).toBe('pos-k1');

    const objectStyle = vi.fn((params: { key: string }) => {
      if (typeof params !== 'object' || params === null) {
        throw new TypeError('expected object', { cause: params });
      }
      return `obj-${params.key}`;
    });
    expect(invokeResolver(objectStyle, 'k2', null, undefined, ctrl.signal)).toBe('obj-k2');
  });
});
