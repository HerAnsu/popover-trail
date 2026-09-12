import { describe, it, expect, vi } from 'vitest';
import { using, usingAsync } from './resourceScope';
import { createDisposable } from './singleDisposable';
import type { AsyncScopeDisposable } from './disposableTypes';

describe('resourceScope: using & usingAsync', () => {
  it('executes callback and cleans up resource on success', () => {
    const cleanup = vi.fn();
    const res = createDisposable(cleanup);

    const result = using(res, () => 42);
    expect(result).toBe(42);
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('guarantees cleanup even when callback throws', () => {
    const cleanup = vi.fn();
    const res = createDisposable(cleanup);

    expect(() =>
      using(res, () => {
        throw new Error('Scope failure');
      }),
    ).toThrow('Scope failure');

    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('handles async scope execution and cleanup with usingAsync', async () => {
    const cleanup = vi.fn();
    const asyncRes: AsyncScopeDisposable = {
      disposeAsync: async () => { cleanup(); },
    };

    const val = await usingAsync(asyncRes, async () => {
      await Promise.resolve();
      return 'async result';
    });

    expect(val).toBe('async result');
    expect(cleanup).toHaveBeenCalledTimes(1);
  });

  it('guarantees async cleanup even when async callback rejects', async () => {
    const cleanup = vi.fn();
    const asyncRes: AsyncScopeDisposable = {
      disposeAsync: async () => { cleanup(); },
    };

    await expect(
      usingAsync(asyncRes, async () => {
        throw new Error('Async error');
      }),
    ).rejects.toThrow('Async error');

    expect(cleanup).toHaveBeenCalledTimes(1);
  });
});
