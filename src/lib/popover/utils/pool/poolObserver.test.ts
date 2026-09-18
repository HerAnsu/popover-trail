import { describe, it, expect, vi } from 'vitest';
import { PoolObserverHub, type PoolObserver } from './poolObserver';
import { ObjectPool } from './objectPoolCore';

describe('poolObserver', () => {
  it('dispatches lifecycle events to registered observers', () => {
    const onAcquire = vi.fn();
    const onRelease = vi.fn();
    const onEvict = vi.fn();
    const onPreallocate = vi.fn();
    const onDrain = vi.fn();

    const pool = new ObjectPool(() => ({ id: 1 }), undefined, 0, 2);
    const unsubscribe = pool.addObserver({
      onAcquire,
      onRelease,
      onEvict,
      onPreallocate,
      onDrain,
    });

    pool.preallocate(2);
    expect(onPreallocate).toHaveBeenCalledWith(2);

    const a = pool.acquire();
    expect(onAcquire).toHaveBeenCalledWith(a, true);

    pool.release(a);
    expect(onRelease).toHaveBeenCalledWith(a);

    // Fill pool and trigger eviction on overflow
    const b = { id: 2 };
    const c = { id: 3 };
    pool.release(b);
    pool.release(c); // overflow eviction
    expect(onEvict).toHaveBeenCalledWith(c);

    pool.drain(0);
    expect(onDrain).toHaveBeenCalled();

    unsubscribe();
    pool.preallocate(1);
    expect(onPreallocate).toHaveBeenCalledTimes(1); // not called again
  });

  it('isolates exceptions thrown inside observer callbacks', () => {
    const hub = new PoolObserverHub<{ v: number }>();
    const buggyObserver: PoolObserver<{ v: number }> = {
      onAcquire: () => {
        throw new Error('Observer failure');
      },
      onRelease: () => {
        throw new Error('Observer failure');
      },
      onEvict: () => {
        throw new Error('Observer failure');
      },
      onPreallocate: () => {
        throw new Error('Observer failure');
      },
      onDrain: () => {
        throw new Error('Observer failure');
      },
    };

    hub.subscribe(buggyObserver);

    // None of these notifications should throw
    expect(() => hub.notifyAcquire({ v: 1 }, false)).not.toThrow();
    expect(() => hub.notifyRelease({ v: 1 })).not.toThrow();
    expect(() => hub.notifyEvict({ v: 1 })).not.toThrow();
    expect(() => hub.notifyPreallocate(5)).not.toThrow();
    expect(() => hub.notifyDrain(5)).not.toThrow();
  });

  it('allows clearing all observers', () => {
    const hub = new PoolObserverHub<number>();
    hub.subscribe({ onRelease: vi.fn() });
    hub.subscribe({ onRelease: vi.fn() });
    expect(hub.size).toBe(2);

    hub.clear();
    expect(hub.size).toBe(0);
  });
});
