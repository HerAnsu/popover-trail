/**
 * Pool Lifecycle Observers and Event Dispatcher Hub.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolObserver
 */

export interface PoolObserver<T> {
  onAcquire?(item: T, hit: boolean): void;
  onRelease?(item: T): void;
  onEvict?(item: T): void;
  onPreallocate?(count: number): void;
  onDrain?(count: number): void;
}

export class PoolObserverHub<T> {
  private readonly observers: Array<PoolObserver<T>> = [];

  subscribe(observer: PoolObserver<T>): () => void {
    this.observers.push(observer);
    return () => {
      const idx = this.observers.indexOf(observer);
      if (idx !== -1) this.observers.splice(idx, 1);
    };
  }

  notifyAcquire(item: T, hit: boolean): void {
    for (const obs of this.observers) {
      try {
        obs.onAcquire?.(item, hit);
      } catch {
        /* fault isolation */
      }
    }
  }

  notifyRelease(item: T): void {
    for (const obs of this.observers) {
      try {
        obs.onRelease?.(item);
      } catch {
        /* fault isolation */
      }
    }
  }

  notifyEvict(item: T): void {
    for (const obs of this.observers) {
      try {
        obs.onEvict?.(item);
      } catch {
        /* fault isolation */
      }
    }
  }

  notifyPreallocate(count: number): void {
    for (const obs of this.observers) {
      try {
        obs.onPreallocate?.(count);
      } catch {
        /* fault isolation */
      }
    }
  }

  notifyDrain(count: number): void {
    for (const obs of this.observers) {
      try {
        obs.onDrain?.(count);
      } catch {
        /* fault isolation */
      }
    }
  }

  get size(): number {
    return this.observers.length;
  }
  clear(): void {
    this.observers.length = 0;
  }
}
