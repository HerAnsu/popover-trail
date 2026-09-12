/**
 * Coordinates window focus and network reconnection revalidations.
 *
 * @module cache/cacheEventRevalidator
 */

import { DISPOSE_SYMBOL } from '../disposable';

export class CacheEventRevalidator {
  public readonly capacity = 100;
  private readonly listeners = new Set<() => void>();
  private bound = false;
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly debounceMs: number;

  constructor(debounceMs = 200) {
    this.debounceMs = debounceMs;
  }

  private readonly handleTrigger = (): void => {
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      for (const listener of this.listeners) {
        try {
          listener();
        } catch {
          // Fault isolation
        }
      }
    }, this.debounceMs);
  };

  public register(callback: () => void): () => void {
    if (this.listeners.size >= this.capacity) return () => {};
    this.listeners.add(callback);
    this.ensureBound();
    return () => {
      this.listeners.delete(callback);
      if (this.listeners.size === 0) this.unbind();
    };
  }

  private ensureBound(): void {
    if (this.bound || typeof window === 'undefined') return;
    window.addEventListener('focus', this.handleTrigger);
    window.addEventListener('online', this.handleTrigger);
    window.addEventListener('visibilitychange', this.handleVisibility);
    this.bound = true;
  }

  private readonly handleVisibility = (): void => {
    if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
      this.handleTrigger();
    }
  };

  private unbind(): void {
    if (!this.bound || typeof window === 'undefined') return;
    window.removeEventListener('focus', this.handleTrigger);
    window.removeEventListener('online', this.handleTrigger);
    window.removeEventListener('visibilitychange', this.handleVisibility);
    this.bound = false;
  }

  public trigger(): void {
    this.handleTrigger();
  }

  public destroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    this.unbind();
    this.listeners.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.destroy();
  }
}

export const globalCacheEventRevalidator = new CacheEventRevalidator();
