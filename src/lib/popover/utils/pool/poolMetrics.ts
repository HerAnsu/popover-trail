/**
 * Object Pool Telemetry and Allocation Tracking.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/pool/poolMetrics
 */

import type { ObjectPoolMetrics } from './poolTypes';

export class PoolMetricsTracker {
  allocated = 0;
  acquired = 0;
  released = 0;
  hits = 0;
  misses = 0;
  peakInUse = 0;

  recordAcquire(isHit: boolean): void {
    this.acquired++;
    if (isHit) this.hits++;
    else {
      this.misses++;
      this.allocated++;
    }
    const currentInUse = this.acquired - this.released;
    if (currentInUse > this.peakInUse) this.peakInUse = currentInUse;
  }

  recordRelease(): void {
    this.released++;
  }

  recordPreallocate(count: number): void {
    this.allocated += count;
  }

  getSnapshot(available: number, capacity: number): ObjectPoolMetrics {
    const inUse = Math.max(0, this.acquired - this.released);
    const totalRequests = this.hits + this.misses;
    const hitRate = totalRequests > 0 ? this.hits / totalRequests : 0;

    return {
      allocated: this.allocated,
      inUse,
      peakInUse: this.peakInUse,
      hits: this.hits,
      misses: this.misses,
      hitRate,
      available,
      capacity,
    };
  }

  reset(): void {
    this.allocated = 0;
    this.acquired = 0;
    this.released = 0;
    this.hits = 0;
    this.misses = 0;
    this.peakInUse = 0;
  }
}
