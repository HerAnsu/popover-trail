import { describe, it, expect, vi } from 'vitest';
import {
  isPromise,
  sleep,
  deferMicrotask,
  deferred,
  withTimeout,
  debounce,
  throttle,
  retryAsync,
  createAsyncMutex,
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

  describe('retryAsync', () => {
    it('resolves immediately when operation succeeds on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');
      const result = await retryAsync(fn, { retries: 3, delayMs: 1 });
      expect(result).toBe('success');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('retries until success within attempt limit', async () => {
      let attempts = 0;
      const fn = vi.fn().mockImplementation(async () => {
        attempts++;
        if (attempts < 3) throw new Error('temporary failure');
        return 'recovered';
      });

      const result = await retryAsync(fn, { retries: 3, delayMs: 1 });
      expect(result).toBe('recovered');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('throws the last error when retries are exhausted', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('fatal failure'));
      await expect(retryAsync(fn, { retries: 2, delayMs: 1 })).rejects.toThrow(
        'fatal failure',
      );
      expect(fn).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
    });

    it('stops retrying when shouldRetry returns false', async () => {
      const fn = vi.fn().mockRejectedValue(new Error('unretryable error'));
      await expect(
        retryAsync(fn, {
          retries: 5,
          delayMs: 1,
          shouldRetry: (err) => err instanceof Error && err.message !== 'unretryable error',
        }),
      ).rejects.toThrow('unretryable error');
      expect(fn).toHaveBeenCalledTimes(1);
    });
  });

  describe('createAsyncMutex', () => {
    it('executes tasks serially without race conditions', async () => {
      const mutex = createAsyncMutex();
      const executionOrder: number[] = [];

      const task1 = mutex.runExclusive(async () => {
        await sleep(10);
        executionOrder.push(1);
        return 1;
      });

      const task2 = mutex.runExclusive(async () => {
        await sleep(5);
        executionOrder.push(2);
        return 2;
      });

      const [res1, res2] = await Promise.all([task1, task2]);
      expect(res1).toBe(1);
      expect(res2).toBe(2);
      expect(executionOrder).toEqual([1, 2]);
    });

    it('continues executing subsequent tasks even if a task rejects', async () => {
      const mutex = createAsyncMutex();
      const task1 = mutex.runExclusive(async () => {
        throw new Error('task 1 failed');
      });

      const task2 = mutex.runExclusive(async () => {
        return 'task 2 succeeded';
      });

      await expect(task1).rejects.toThrow('task 1 failed');
      const res2 = await task2;
      expect(res2).toBe('task 2 succeeded');
      expect(mutex.isLocked()).toBe(false);
    });
  });
});

