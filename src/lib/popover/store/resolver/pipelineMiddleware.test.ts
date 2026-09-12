import { describe, it, expect, vi } from 'vitest';
import { ResolverCacheManager } from './ResolverCacheManager';
import { InFlightPromiseCache } from '../controllers/InFlightPromiseCache';
import {
  withL1Cache,
  withInFlightDeduplication,
  withAbortSignal,
  type ResolverHandler,
} from './pipelineMiddleware';
import type { PopoverCache } from '../../types';

describe('resolver/pipelineMiddleware', () => {
  it('withL1Cache returns cached data on hit and writes through on miss', async () => {
    const memory = new Map<string, string>();
    const mockCache: PopoverCache<string> = {
      get: (k) => memory.get(k),
      set: (k, v) => {
        memory.set(k, v);
      },
      has: (k) => memory.has(k),
      delete: (k) => memory.delete(k),
      clear: () => memory.clear(),
    };
    const cacheManager = new ResolverCacheManager(mockCache);
    cacheManager.writeSync('cached-key', 'cached-value');

    const nextFn = vi.fn(async (params: { key: string }) => `resolved-${params.key}`);
    const wrapped = withL1Cache<string>(cacheManager)(nextFn);

    const hit = await wrapped({ key: 'cached-key', signal: new AbortController().signal });
    expect(hit).toBe('cached-value');
    expect(nextFn).not.toHaveBeenCalled();

    const miss = await wrapped({ key: 'new-key', signal: new AbortController().signal });
    expect(miss).toBe('resolved-new-key');
    expect(nextFn).toHaveBeenCalledTimes(1);
    expect(cacheManager.readSync('new-key')).toBe('resolved-new-key');
  });

  it('withInFlightDeduplication reuses in-flight promise for concurrent identical keys', async () => {
    const promiseCache = new InFlightPromiseCache<number>();
    let callCount = 0;
    const slowTask: ResolverHandler<number> = async () => {
      callCount++;
      await new Promise((r) => setTimeout(r, 10));
      return callCount;
    };

    const middleware = withInFlightDeduplication<number>(promiseCache)(slowTask);
    const ctrl = new AbortController();

    const [res1, res2] = await Promise.all([
      middleware({ key: 'concurrent-k', signal: ctrl.signal }),
      middleware({ key: 'concurrent-k', signal: ctrl.signal }),
    ]);

    expect(res1).toBe(1);
    expect(res2).toBe(1);
    expect(callCount).toBe(1);
  });

  it('withAbortSignal aborts prior to execution or during asynchronous resolution', async () => {
    const preAborted = new AbortController();
    preAborted.abort();

    const handler: ResolverHandler<string> = vi.fn(async () => 'never');
    const guarded = withAbortSignal<string>()(handler);

    await expect(guarded({ key: 'k1', signal: preAborted.signal })).rejects.toThrow(
      'Aborted before execution',
    );
    expect(handler).not.toHaveBeenCalled();

    const inFlightCtrl = new AbortController();
    const delayedHandler: ResolverHandler<string> = vi.fn(async () => {
      inFlightCtrl.abort();
      return 'delayed';
    });
    const guardedDelayed = withAbortSignal<string>()(delayedHandler);

    await expect(guardedDelayed({ key: 'k2', signal: inFlightCtrl.signal })).rejects.toThrow(
      'Aborted during resolution',
    );
  });
});
