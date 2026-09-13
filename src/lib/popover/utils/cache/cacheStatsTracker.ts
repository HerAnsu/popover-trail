/**
 * Performance telemetry and hit-ratio tracker for cache auditing.
 *
 * @module cache/cacheStatsTracker
 */

import type { CacheStats } from './cacheTypes';
import { roundTo } from '../math';

export class CacheStatsTracker {
  public readonly capacity: number;
  private hitsCount = 0;
  private missesCount = 0;

  constructor(capacity = 1000) {
    this.capacity = capacity;
  }

  public recordHit(): void {
    this.hitsCount++;
  }

  public recordMiss(): void {
    this.missesCount++;
  }

  public getStats(currentSize: number): CacheStats {
    const total = this.hitsCount + this.missesCount;
    const hitRatio = total > 0 ? roundTo(this.hitsCount / total, 3) : 0;
    return {
      size: currentSize,
      hits: this.hitsCount,
      misses: this.missesCount,
      hitRatio,
    };
  }

  public reset(): void {
    this.hitsCount = 0;
    this.missesCount = 0;
  }
}
