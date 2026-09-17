/**
 * SWR asynchronous runner with in-flight deduplication and exponential retry.
 *
 * @module cache/cacheSWRRunner
 */

import { sleep } from '../asyncUtils';
import { clamp } from '../math';

/**
 * Asynchronous task runner providing in-flight promise deduplication and exponential retry backoff.
 * Prevents redundant simultaneous fetches for identical cache keys and gracefully handles network hiccups.
 *
 * @template T - The resolved value type.
 *
 * @example
 * ```ts
 * const runner = new CacheSWRRunner<UserData>(50);
 * const data = await runner.runDeduplicated('user-42', () => fetchUser('42'));
 * ```
 */
export class CacheSWRRunner<T = unknown> {
  public readonly capacity: number;
  private readonly inFlight = new Map<string, Promise<T>>();

  constructor(capacity = 100) {
    this.capacity = capacity;
  }

  /**
   * Executes a task function deduplicating simultaneous requests for the same key.
   * If a task for the key is already running, returns the existing in-flight Promise.
   *
   * @param key - Unique cache key identifier.
   * @param task - Async task returning the desired value.
   * @returns Promise resolving to the task outcome.
   *
   * @example
   * ```ts
   * const p1 = runner.runDeduplicated('key1', fetchFn);
   * const p2 = runner.runDeduplicated('key1', fetchFn);
   * // p1 === p2, only one fetchFn call is initiated.
   * ```
   */
  public async runDeduplicated(key: string, task: () => Promise<T>): Promise<T> {
    const existing = this.inFlight.get(key);
    if (existing) return existing;

    if (this.inFlight.size >= this.capacity) {
      const oldest = this.inFlight.keys().next().value;
      if (oldest !== undefined) this.inFlight.delete(oldest);
    }

    const promise = task().finally(() => {
      if (this.inFlight.get(key) === promise) {
        this.inFlight.delete(key);
      }
    });

    this.inFlight.set(key, promise);
    return promise;
  }

  /**
   * Runs an asynchronous task with exponential backoff and jittered delays on failure.
   *
   * @param task - Async task function to execute.
   * @param retries - Maximum number of retries before throwing (default: 2).
   * @param baseDelayMs - Base retry delay in milliseconds (default: 200).
   * @param attempt - Internal tracker for the current attempt count.
   * @returns Promise resolving to the successful task output.
   *
   * @example
   * ```ts
   * const result = await runner.runWithRetry(() => fetchApi('/endpoint'), 3, 300);
   * ```
   */
  public async runWithRetry(
    task: () => Promise<T>,
    retries = 2,
    baseDelayMs = 200,
    attempt = 1,
  ): Promise<T> {
    try {
      return await task();
    } catch (err) {
      if (attempt > retries) throw err;
      const jitter = (attempt * 17) % 50;
      const delay = clamp(baseDelayMs * Math.pow(2, attempt - 1), 0, 2000) + jitter;
      await sleep(delay);
      return this.runWithRetry(task, retries, baseDelayMs, attempt + 1);
    }
  }

  /**
   * Checks whether an asynchronous operation is currently in-flight for the specified key.
   *
   * @param key - The cache key to check.
   * @returns `true` if a request is actively in-flight; `false` otherwise.
   */
  public isInFlight(key: string): boolean {
    return this.inFlight.has(key);
  }

  /**
   * Clears all in-flight tracking entries.
   */
  public clear(): void {
    this.inFlight.clear();
  }
}
