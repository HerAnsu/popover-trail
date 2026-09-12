/**
 * Generic Object Pool Contracts, Options, and Telemetry Types.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolTypes
 */

import { DISPOSE_SYMBOL } from '../disposable';
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
