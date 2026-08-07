/**
 * Generic High-Performance Object Pool for popover-trail.
 * Recycles temporary geometry objects during high-frequency drag and spatial operations
 * to achieve Zero-GC heap allocation during rendering loops.
 *
 * @module objectPool
 */

export class ObjectPool<T> {
  private pool: T[] = [];
  private factory: () => T;
  private reset?: (item: T) => void;
  private maxCapacity: number;

  constructor(
    factory: () => T,
    reset?: (item: T) => void,
    initialCapacity = 32,
    maxCapacity = 256,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxCapacity = maxCapacity;
    for (let i = 0; i < initialCapacity; i++) {
      this.pool.push(factory());
    }
  }

  acquire(): T {
    return this.pool.pop() ?? this.factory();
  }

  release(item: T): void {
    if (this.reset) {
      this.reset(item);
    }
    if (this.pool.length < this.maxCapacity) {
      this.pool.push(item);
    }
  }

  clear(): void {
    this.pool.length = 0;
  }
}
