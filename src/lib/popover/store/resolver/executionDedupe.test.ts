import { describe, it, expect, vi } from 'vitest';
import { startInFlightResolver } from './inFlightLauncher';
import { trackInFlight } from './inFlightRunner';
import type { ResolverPipelineDependencies } from './resolverTypes';

describe('resolver/executionDedupe', () => {
  const makeDeps = () => {
    const deps: ResolverPipelineDependencies<unknown, unknown, string> = {
      popoverDAG: undefined as never,
      resolveData: vi.fn(),
      inFlightPromises: new Map<string, Promise<unknown>>(),
      registerController: vi.fn(() => new AbortController()),
      removeController: vi.fn(),
      safeSet: vi.fn(),
      findEntryByKey: () => undefined,
      eventListeners: undefined,
      eventBus: undefined,
    };
    return { deps };
  };

  it('registers in-flight promise and cleans it up when settled', async () => {
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

  it('maintains identity guard so late settling promises cannot evict newer registrations', async () => {
    const map = new Map<string, Promise<number>>();

    let releaseFirst!: (v: number) => void;
    const first = trackInFlight(
      map,
      'k',
      () =>
        new Promise<number>((r) => {
          releaseFirst = r;
        }),
    );

    let releaseSecond!: (v: number) => void;
    const second = trackInFlight(
      map,
      'k',
      () =>
        new Promise<number>((r) => {
          releaseSecond = r;
        }),
    );

    expect(map.get('k')).toBe(second);

    releaseFirst(1);
    await first;
    expect(map.has('k')).toBe(true);

    releaseSecond(2);
    await second;
    expect(map.has('k')).toBe(false);
  });
});
