import { describe, it, expect, vi } from 'vitest';
import { usingResult, usingAsyncResult } from './resourceScope';
import { Ok, Err } from '../result';
import type { ScopeDisposable, AsyncScopeDisposable } from './disposableTypes';

describe('Scoped Monadic Resource Execution (usingResult, usingAsyncResult)', () => {
  it('disposes resource on Ok Result in usingResult', () => {
    let disposed = false;
    const resource: ScopeDisposable = {
      dispose: () => {
        disposed = true;
      },
    };

    const result = usingResult(resource, (r) => {
      expect(r).toBe(resource);
      return Ok(100);
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe(100);
    }
    expect(disposed).toBe(true);
  });

  it('disposes resource on Err Result in usingResult', () => {
    let disposed = false;
    const resource: ScopeDisposable = {
      dispose: () => {
        disposed = true;
      },
    };

    const result = usingResult(resource, () => Err('domain_failure'));

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('domain_failure');
    }
    expect(disposed).toBe(true);
  });

  it('catches thrown exception, converts via onError, and disposes resource', () => {
    let disposed = false;
    const resource: ScopeDisposable = {
      dispose: () => {
        disposed = true;
      },
    };

    const result = usingResult(
      resource,
      () => {
        throw new Error('boom');
      },
      (e) => `caught_${(e as Error).message}`,
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('caught_boom');
    }
    expect(disposed).toBe(true);
  });

  it('asynchronously disposes resource on Ok Result in usingAsyncResult', async () => {
    const disposeSpy = vi.fn(async () => {});
    const asyncResource: AsyncScopeDisposable = {
      disposeAsync: disposeSpy,
    };

    const result = await usingAsyncResult(asyncResource, async () => {
      return Ok('async_ok');
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toBe('async_ok');
    }
    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('asynchronously disposes resource on Err Result in usingAsyncResult', async () => {
    const disposeSpy = vi.fn(async () => {});
    const asyncResource: AsyncScopeDisposable = {
      disposeAsync: disposeSpy,
    };

    const result = await usingAsyncResult(asyncResource, async () => {
      return Err('async_failure');
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBe('async_failure');
    }
    expect(disposeSpy).toHaveBeenCalledOnce();
  });
});
