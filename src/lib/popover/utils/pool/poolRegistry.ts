/**
 * Global Object Pool Registry for Centralized Multi-Pool Management.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolRegistry
 */

import type { AggregatedPoolMetrics, ObjectPoolMetrics } from './poolTypes';
import { ObjectPoolBase } from './poolBase';
import type { PoolHealthReport } from './poolHealth';

export interface AnyObjectPool {
  drain(keepCapacity?: number): void;
  clear(): void;
  getHealth(): PoolHealthReport;
  getMetrics(): ObjectPoolMetrics;
}

function isObjectPoolBase<T>(val: unknown): val is ObjectPoolBase<T> {
  return val instanceof ObjectPoolBase;
}

export class ObjectPoolRegistry {
  private readonly pools = new Map<string, AnyObjectPool>();

  register<T>(name: string, pool: ObjectPoolBase<T>): void {
    this.pools.set(name, pool);
  }

  get<T>(name: string): ObjectPoolBase<T> | undefined {
    const pool = this.pools.get(name);
    return isObjectPoolBase<T>(pool) ? pool : undefined;
  }

  has(name: string): boolean {
    return this.pools.has(name);
  }

  unregister(name: string): boolean {
    return this.pools.delete(name);
  }

  drainAll(keepCapacity?: number): void {
    for (const pool of this.pools.values()) pool.drain(keepCapacity);
  }

  clearAll(): void {
    for (const pool of this.pools.values()) pool.clear();
  }

  getHealthSummary(): Map<string, PoolHealthReport> {
    const map = new Map<string, PoolHealthReport>();
    for (const [name, pool] of this.pools.entries()) {
      map.set(name, pool.getHealth());
    }
    return map;
  }

  getAggregatedMetrics(): AggregatedPoolMetrics {
    let totalAllocated = 0;
    let totalInUse = 0;
    let totalAvailable = 0;
    let sumHitRate = 0;

    for (const pool of this.pools.values()) {
      const m = pool.getMetrics();
      totalAllocated += m.allocated;
      totalInUse += m.inUse;
      totalAvailable += m.available;
      sumHitRate += m.hitRate;
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
