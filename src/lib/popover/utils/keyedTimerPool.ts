import { deferMicrotask } from './asyncUtils';
import { DISPOSE_SYMBOL } from './disposable';

/**
 * RAII Keyed Timer Pool.
 * Manages scheduled timeouts associated with unique keys with deterministic cleanup and zero-delay fast paths.
 *
 * Prevents timer leaks across dynamic UI lifecycles (such as hover delays, auto-dismiss timeouts).
 *
 * @template TKey - Key identifier type (defaults to string).
 *
 * @example
 * ```typescript
 * const pool = new KeyedTimerPool<string>();
 *
 * // Schedule 300ms hover timer:
 * pool.schedule('card-1', 300, () => openCard('card-1'));
 *
 * // Cancel before it fires:
 * pool.cancel('card-1');
 *
 * // Or teardown all timers on component unmount:
 * pool.dispose();
 * ```
 */
export class KeyedTimerPool<TKey = string> {
  private readonly timers = new Map<TKey, ReturnType<typeof setTimeout>>();
  private isDisposed = false;

  /**
   * Number of pending scheduled timers currently in the pool.
   */
  public get size(): number {
    return this.timers.size;
  }

  /**
   * Checks if a timer is currently scheduled for the specified key.
   *
   * @param key - Identifier to check.
   * @returns True if a timer is active.
   */
  public has(key: TKey): boolean {
    return this.timers.has(key);
  }

  /**
   * Schedules a delayed callback for the specified key, automatically cancelling any previous timer for that key.
   * If delay is 0 or negative, executes via `deferMicrotask` to avoid macro-timer overhead.
   *
   * @param key - Timer identifier.
   * @param delay - Delay in milliseconds.
   * @param callback - Function to execute when timer expires.
   *
   * @example
   * ```typescript
   * pool.schedule('menu', 200, () => showMenu());
   * ```
   */
  public schedule(key: TKey, delay: number, callback: () => void): void {
    if (this.isDisposed) return;
    this.cancel(key);

    if (delay <= 0) {
      deferMicrotask(() => {
        if (!this.isDisposed) {
          callback();
        }
      });
      return;
    }

    const timerId = setTimeout(() => {
      this.timers.delete(key);
      if (!this.isDisposed) {
        callback();
      }
    }, delay);

    this.timers.set(key, timerId);
  }

  /**
   * Cancels a pending timer by its key.
   *
   * @param key - Timer identifier to cancel.
   * @returns True if a timer was found and cancelled, false otherwise.
   *
   * @example
   * ```typescript
   * pool.cancel('menu');
   * ```
   */
  public cancel(key: TKey): boolean {
    const timerId = this.timers.get(key);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.timers.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Cancels all timers matching the provided sequence of keys.
   *
   * @param keys - Iterable collection of keys to cancel.
   *
   * @example
   * ```typescript
   * pool.cancelKeys(['card-1', 'card-2']);
   * ```
   */
  public cancelKeys(keys: Iterable<TKey>): void {
    for (const key of keys) {
      this.cancel(key);
    }
  }

  /**
   * Cancels and clears all currently scheduled timers in the pool.
   *
   * @example
   * ```typescript
   * pool.cancelAll();
   * ```
   */
  public cancelAll(): void {
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  /**
   * Disposes the timer pool, cancelling all active timers and rejecting future scheduling.
   */
  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.cancelAll();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
