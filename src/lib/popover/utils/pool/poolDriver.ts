/**
 * Internal Driver Abstraction and Concrete Slabs for Unified Object Pool.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolDriver
 */

import type { ObjectPoolMetrics, UnifiedPoolOptions } from './poolTypes';
import { ObjectPool } from './objectPoolCore';
import { FixedPool } from './fixedPool';

/**
 * Underlying implementation driver contract for `Pool<T>`.
 */
export interface PoolDriver<T> {
  acquire(): T;
  release(item?: T | null): boolean;
  clear(): void;
  dispose(): void;
  readonly size: number;
  readonly inUse: number;
  readonly capacity: number;
  readonly isFull: boolean;
  readonly isEmpty: boolean;
  getMetrics?(): ObjectPoolMetrics;
  prewarm?(count: number): void;
}

/**
 * Encapsulates the resolved driver and reset lifecycle policies.
 */
export interface ResolvedPoolDriver<T> {
  readonly driver: PoolDriver<T>;
  readonly resetCallback?: (item: T) => void;
  readonly resetOnAcquire: boolean;
}

/**
 * Instantiates and configures the underlying pool driver based on execution mode.
 *
 * @template T - Pooled object type.
 * @param factory - Resource instantiation factory.
 * @param options - Unified pool configuration.
 * @returns Configured driver and reset policies.
 */
export function createPoolDriver<T extends object>(
  factory: () => T,
  options: UnifiedPoolOptions<T> = {},
): ResolvedPoolDriver<T> {
  const {
    mode = 'dynamic',
    reset,
    resetOn = 'release',
    initialCapacity = 32,
    maxCapacity = 256,
  } = options;

  const resetOnAcquire = Boolean(reset && (resetOn === 'acquire' || resetOn === 'both'));
  const driverReset = resetOn === 'acquire' ? undefined : reset;

  if (mode === 'fixed') {
    const fixed = new FixedPool<T>(factory, initialCapacity, driverReset);
    return {
      resetCallback: reset,
      resetOnAcquire,
      driver: {
        acquire: () => fixed.acquire(),
        release: (item) => fixed.release(item),
        clear: () => fixed.clear(),
        dispose: () => fixed.dispose(),
        get size() { return fixed.size; },
        get inUse() { return fixed.inUse; },
        get capacity() { return fixed.capacity; },
        get isFull() { return fixed.isFull; },
        get isEmpty() { return fixed.isEmpty; },
        prewarm: (count) => { fixed.prewarm(count); },
      },
    };
  }

  const dyn = new ObjectPool<T>({
    ...options,
    factory,
    reset: driverReset,
    initialCapacity,
    maxCapacity,
  });

  return {
    resetCallback: reset,
    resetOnAcquire,
    driver: {
      acquire: () => dyn.acquire(),
      release: (item) => {
        dyn.release(item);
        return true;
      },
      clear: () => dyn.clear(),
      dispose: () => dyn.dispose(),
      get size() { return dyn.size; },
      get inUse() { return dyn.inUse; },
      get capacity() { return dyn.capacity; },
      get isFull() { return dyn.size >= dyn.capacity; },
      get isEmpty() { return dyn.size === 0; },
      getMetrics: () => dyn.getMetrics(),
      prewarm: (count) => { dyn.warmup(count); },
    },
  };
}
