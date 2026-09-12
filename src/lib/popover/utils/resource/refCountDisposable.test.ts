import { describe, it, expect, vi } from 'vitest';
import { RefCountDisposable } from './refCountDisposable';
import { DISPOSE_SYMBOL } from './disposableTypes';

describe('RefCountDisposable', () => {
  it('disposes underlying only when all acquired references and primary are disposed', () => {
    const underlying = vi.fn();
    const refCounted = new RefCountDisposable(underlying);

    expect(refCounted.count).toBe(0);
    const sub1 = refCounted.acquire();
    const sub2 = refCounted.acquire();
    expect(refCounted.count).toBe(2);

    refCounted.dispose();
    expect(underlying).not.toHaveBeenCalled();
    expect(refCounted.isDisposed).toBe(false);

    sub1.dispose();
    expect(refCounted.count).toBe(1);
    expect(underlying).not.toHaveBeenCalled();

    sub2.dispose();
    expect(refCounted.count).toBe(0);
    expect(underlying).toHaveBeenCalledTimes(1);
    expect(refCounted.isDisposed).toBe(true);
  });

  it('disposes immediately if primary is disposed when count is 0', () => {
    const underlying = vi.fn();
    const refCounted = new RefCountDisposable(underlying);

    refCounted.dispose();
    expect(underlying).toHaveBeenCalledTimes(1);
    expect(refCounted.isDisposed).toBe(true);
  });

  it('acquire after disposal returns already disposed token', () => {
    const underlying = vi.fn();
    const refCounted = new RefCountDisposable(underlying);
    refCounted.dispose();

    const sub = refCounted.acquire();
    expect(sub.isDisposed).toBe(true);
    expect(refCounted.count).toBe(0);
  });

  it('supports [DISPOSE_SYMBOL]', () => {
    const underlying = vi.fn();
    const refCounted = new RefCountDisposable(underlying);

    const fn = refCounted[DISPOSE_SYMBOL];
    if (fn) {
      fn.call(refCounted);
    }
    expect(underlying).toHaveBeenCalledTimes(1);
    expect(refCounted.isDisposed).toBe(true);
  });
});
