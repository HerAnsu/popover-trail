/**
 * Generic High-Performance Object Pool for popover-trail.
 * Recycles temporary geometry objects during high-frequency drag and spatial collision calculations
 * to achieve Zero-GC heap allocation during 60/120 FPS animation loops.
 *
 * @remarks
 * Avoids garbage collection pauses by reusing pre-allocated objects instead of creating new instances
 * on every pointer movement frame.
 *
 * @example
 * ```typescript
 * const pointPool = new ObjectPool<{ x: number; y: number }>(
 *   () => ({ x: 0, y: 0 }),
 *   (pt) => { pt.x = 0; pt.y = 0; },
 *   16,
 *   64
 * );
 *
 * const pt = pointPool.acquire();
 * pt.x = 100;
 * pt.y = 200;
 * // ... use point ...
 * pointPool.release(pt); // returned to pool for future reuse
 * ```
 *
 * @template T - Object structure type managed by the pool.
 */
export class ObjectPool<T> {
  private readonly pool: T[] = [];
  private readonly factory: () => T;
  private readonly reset?: (item: T) => void;
  private readonly maxCapacity: number;

  /**
   * Initializes the pool with pre-allocated instances.
   *
   * @param factory - Constructor function creating new object instances.
   * @param reset - Optional mutator callback resetting object state prior to recycling.
   * @param initialCapacity - Number of objects to pre-allocate eagerly (defaults to 32).
   * @param maxCapacity - Maximum ceiling of recycled objects retained in pool (defaults to 256).
   */
  constructor(
    factory: () => T,
    reset?: (item: T) => void,
    initialCapacity = 32,
    maxCapacity = 256,
  ) {
    this.factory = factory;
    this.reset = reset;
    this.maxCapacity = Math.max(1, maxCapacity);
    const safeInitial = Math.min(Math.max(0, initialCapacity), this.maxCapacity);
    for (let i = 0; i < safeInitial; i++) {
      this.pool.push(factory());
    }
  }

  /**
   * Acquires a recycled instance from the pool, or creates a new one if the pool is exhausted.
   *
   * @returns An object ready for immediate use.
   */
  acquire(): T {
    return this.pool.pop() ?? this.factory();
  }

  /**
   * Releases an object back into the pool for future reuse.
   * Executes the `reset` callback if provided.
   *
   * @param item - The object instance to recycle.
   */
  release(item?: T | null): void {
    if (item === null || item === undefined) return;
    if (this.pool.includes(item)) return;
    if (this.reset) {
      this.reset(item);
    }
    if (this.pool.length < this.maxCapacity) {
      this.pool.push(item);
    }
  }

  /** Current number of idle objects available in the pool. */
  get size(): number {
    return this.pool.length;
  }

  /** Empties all pooled object references. */
  clear(): void {
    this.pool.length = 0;
  }

  /** Disposable cleanup handle. */
  dispose(): void {
    this.clear();
  }
}
