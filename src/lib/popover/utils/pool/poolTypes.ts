/**
 * Generic Object Pool Contracts, Options, and Telemetry Types.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolTypes
 */

import { DISPOSE_SYMBOL, type ScopeDisposable } from '../disposable';
import type { PoolCapacity, PoolSize, PoolTimeoutMs } from './poolBranded';

export interface ObjectPoolOptions<T> {
  readonly factory: () => T;
  readonly reset?: (item: T) => void;
  readonly initialCapacity?: number | PoolSize;
  readonly maxCapacity?: number | PoolCapacity;
  readonly onEvict?: (item: T) => void;
  readonly idleDrainTimeoutMs?: number | PoolTimeoutMs;
  readonly enableLeakDetection?: boolean;
  readonly leakTimeoutMs?: number | PoolTimeoutMs;
}

/**
 * Execution timing policy for the pool reset callback.
 * - 'release': executes when items are returned to the pool (default).
 * - 'acquire': executes when items are borrowed from the pool.
 * - 'both': executes on both acquisition and release.
 */
export type PoolResetPolicy = 'acquire' | 'release' | 'both';

/**
 * Configuration options for `Pool.create`.
 */
export interface UnifiedPoolOptions<T> extends Partial<Omit<ObjectPoolOptions<T>, 'factory'>> {
  readonly factory?: () => T;
  readonly mode?: 'dynamic' | 'fixed';
  readonly resetOn?: PoolResetPolicy;
}

/**
 * Compile-time tuple type representing an exact length array of `T`.
 */
export type TupleOf<T, N extends number> =
  N extends 1 ? [T] :
  N extends 2 ? [T, T] :
  N extends 3 ? [T, T, T] :
  N extends 4 ? [T, T, T, T] :
  N extends 5 ? [T, T, T, T, T] :
  N extends 6 ? [T, T, T, T, T, T] :
  N extends 7 ? [T, T, T, T, T, T, T] :
  N extends 8 ? [T, T, T, T, T, T, T, T] :
  T[];

/**
 * An acquired pooled item augmented with synchronous RAII disposal contracts.
 * Compatible with the native ECMAScript / TypeScript `using` keyword.
 *
 * @template T - Type of pooled object.
 */
export type Pooled<T> = T & ScopeDisposable & {
  readonly [DISPOSE_SYMBOL]: () => void;
  dispose: () => void;
  readonly isDisposed: boolean;
};

/**
 * An acquired tuple of pooled items augmented with synchronous RAII disposal contracts.
 * Compatible with the native ECMAScript / TypeScript `using` keyword.
 *
 * @template T - Type of pooled object.
 * @template N - Tuple item count.
 */
export type PooledTuple<T, N extends number> = TupleOf<T, N> & ScopeDisposable & {
  readonly [DISPOSE_SYMBOL]: () => void;
  dispose: () => void;
  readonly isDisposed: boolean;
};

export interface ObjectPoolMetrics {
  readonly allocated: number;
  readonly inUse: number;
  readonly peakInUse: number;
  readonly hits: number;
  readonly misses: number;
  readonly hitRate: number;
  readonly available: number;
  readonly capacity: number;
}

export interface LeakedItemInfo {
  readonly acquiredAt: number;
  readonly stack?: string;
}

export interface ScopedPooledItem<T> {
  readonly value: T;
  readonly release: () => void;
  readonly dispose: () => void;
  readonly [DISPOSE_SYMBOL]: () => void;
}

export interface AggregatedPoolMetrics {
  readonly totalPools: number;
  readonly totalAllocated: number;
  readonly totalInUse: number;
  readonly totalAvailable: number;
  readonly averageHitRate: number;
}
