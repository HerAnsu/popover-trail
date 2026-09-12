import { deferMicrotask } from './asyncUtils';
import { DISPOSE_SYMBOL } from './disposable';

/**
 * RAII Keyed Timer Pool.
 * Manages scheduled timeouts associated with unique keys with deterministic cleanup.
 */
export class KeyedTimerPool<TKey = string> {
  private readonly timers = new Map<TKey, ReturnType<typeof setTimeout>>();
  private isDisposed = false;

  public get size(): number {
    return this.timers.size;
  }

  public has(key: TKey): boolean {
    return this.timers.has(key);
  }

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

  public cancel(key: TKey): boolean {
    const timerId = this.timers.get(key);
    if (timerId !== undefined) {
      clearTimeout(timerId);
      this.timers.delete(key);
      return true;
    }
    return false;
  }

  public cancelKeys(keys: Iterable<TKey>): void {
    for (const key of keys) {
      this.cancel(key);
    }
  }

  public cancelAll(): void {
    for (const timerId of this.timers.values()) {
      clearTimeout(timerId);
    }
    this.timers.clear();
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.cancelAll();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
