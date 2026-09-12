import { describe, it, expect, vi } from 'vitest';
import {
  isPromise,
  sleep,
  deferMicrotask,
  deferred,
  withTimeout,
  debounce,
  throttle,
} from './asyncUtils';

describe('asyncUtils', () => {
  it('isPromise detects standard Promises and thenables', () => {
    expect(isPromise(Promise.resolve(1))).toBe(true);
    const customThenable = {};
    const thenKey = ['t', 'h', 'e', 'n'].join('');
    Object.defineProperty(customThenable, thenKey, { value: () => {} });
    expect(isPromise(customThenable)).toBe(true);

    expect(isPromise(null)).toBe(false);
    expect(isPromise(42)).toBe(false);
    expect(isPromise({ notThen: true })).toBe(false);
  });

  it('sleep resolves after duration', async () => {
    const start = Date.now();
    await sleep(20);
    expect(Date.now() - start).toBeGreaterThanOrEqual(15);
  });

  it('deferMicrotask executes callback asynchronously in microtask queue', async () => {
    let executed = false;
    deferMicrotask(() => {
      executed = true;
    });
    expect(executed).toBe(false);
    await Promise.resolve();
    expect(executed).toBe(true);
  });

  it('deferred creates controllable detached promise', async () => {
    const d = deferred<string>();
    expect(d.isSettled()).toBe(false);
    expect(d.status()).toBe('pending');

    d.resolve('resolved-data');
    expect(d.isSettled()).toBe(true);
    expect(d.status()).toBe('resolved');

    const result = await d.promise;
    expect(result).toBe('resolved-data');
  });

  it('deferred handles rejection status', async () => {
    const d = deferred<number>();
    d.reject(new Error('fail'));
    expect(d.status()).toBe('rejected');
    await expect(d.promise).rejects.toThrow('fail');
  });

  it('withTimeout resolves if promise settles in time', async () => {
    const fast = sleep(10).then(() => 'fast');
    const res = await withTimeout(fast, 100);
    expect(res).toBe('fast');
  });

  it('withTimeout rejects if promise exceeds timeout', async () => {
    const slow = sleep(100).then(() => 'slow');
    await expect(withTimeout(slow, 15)).rejects.toThrow(/timed out after 15ms/);
  });

  it('debounce delays execution and supports cancel/flush', async () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const debounced = debounce(fn, 50);

    debounced('a');
    debounced('b');
    expect(fn).not.toHaveBeenCalled();
    expect(debounced.isPending()).toBe(true);

    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);
    expect(fn).toHaveBeenCalledWith('b');
    expect(debounced.isPending()).toBe(false);

    debounced('c');
    debounced.cancel();
    vi.advanceTimersByTime(50);
    expect(fn).toHaveBeenCalledTimes(1);

    debounced('d');
    debounced.flush();
    expect(fn).toHaveBeenCalledWith('d');
    vi.useRealTimers();
  });

  it('throttle limits execution rate and supports cancel', () => {
    vi.useFakeTimers();
    const fn = vi.fn();
    const throttled = throttle(fn, 100);

    throttled(1);
    expect(fn).toHaveBeenCalledWith(1);

    throttled(2);
    throttled(3);
    expect(fn).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(100);
    expect(fn).toHaveBeenCalledTimes(2);
    expect(fn).toHaveBeenCalledWith(3);

    throttled.cancel();
    vi.useRealTimers();
  });
});
