/**
 * Global Object Pool Registry for Centralized Multi-Pool Management.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolRegistry
 */

import type { AggregatedPoolMetrics, ObjectPoolMetrics } from './poolTypes';

export interface AnyObjectPool {
  drain?(keepCapacity?: number): void;
  clear(): void;
  getMetrics(): ObjectPoolMetrics | undefined;
}

export class ObjectPoolRegistry {
  private readonly pools = new Map<string, AnyObjectPool>();

  register<T extends AnyObjectPool = AnyObjectPool>(name: string, pool: T): void {
    this.pools.set(name, pool);
  }

  get<T = AnyObjectPool>(name: string): T | undefined {
    return this.pools.get(name) as T | undefined;
  }

  has(name: string): boolean {
    return this.pools.has(name);
  }

  unregister(name: string): boolean {
    return this.pools.delete(name);
  }

  drainAll(keepCapacity?: number): void {
    for (const pool of this.pools.values()) pool.drain?.(keepCapacity);
  }

  clearAll(): void {
    for (const pool of this.pools.values()) pool.clear();
  }

  getAggregatedMetrics(): AggregatedPoolMetrics {
    let totalAllocated = 0;
    let totalInUse = 0;
    let totalAvailable = 0;
    let sumHitRate = 0;

    for (const pool of this.pools.values()) {
      const m = pool.getMetrics();
      if (m) {
        totalAllocated += m.allocated;
        totalInUse += m.inUse;
        totalAvailable += m.available;
        sumHitRate += m.hitRate;
      }
    }

    const totalPools = this.pools.size;
    const averageHitRate = totalPools > 0 ? sumHitRate / totalPools : 0;

    return {
      totalPools,
      totalAllocated,
      totalInUse,
      totalAvailable,
      averageHitRate,
    };
  }
}

export const globalPoolRegistry = new ObjectPoolRegistry();
