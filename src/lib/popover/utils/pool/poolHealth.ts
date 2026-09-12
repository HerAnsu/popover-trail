/**
 * Pool Diagnostics, Health Scoring, and Dynamic Capacity Recommendations.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolHealth
 */

import type { ObjectPoolMetrics } from './poolTypes';

export type PoolHealthStatus = 'healthy' | 'warning' | 'critical';

export interface PoolHealthReport {
  readonly status: PoolHealthStatus;
  readonly score: number;
  readonly hitRate: number;
  readonly saturationRate: number;
  readonly leakedCount: number;
  readonly recommendations: readonly string[];
}

export function assessPoolHealth(metrics: ObjectPoolMetrics, leakedCount = 0): PoolHealthReport {
  const saturation = metrics.capacity > 0 ? metrics.inUse / metrics.capacity : 0;
  const recs: string[] = [];
  let score = 100;

  if (metrics.hits + metrics.misses > 5 && metrics.hitRate < 0.5) {
    score -= Math.round((0.5 - metrics.hitRate) * 40);
    recs.push('Hit rate is low; consider warming up or preallocating the pool.');
  }

  if (saturation > 0.85) {
    score -= Math.round((saturation - 0.85) * 60);
    recs.push('Pool saturation exceeds 85%; consider increasing maxCapacity.');
  }

  if (leakedCount > 0) {
    score -= Math.min(40, leakedCount * 10);
    recs.push(`${leakedCount} potentially leaked item(s) detected.`);
  }

  const finalScore = Math.max(0, Math.min(100, score));
  const status: PoolHealthStatus =
    finalScore >= 80 ? 'healthy' : finalScore >= 50 ? 'warning' : 'critical';

  if (recs.length === 0) {
    recs.push('Pool is operating with optimal zero-allocation efficiency.');
  }

  return {
    status,
    score: finalScore,
    hitRate: metrics.hitRate,
    saturationRate: saturation,
    leakedCount,
    recommendations: Object.freeze(recs),
  };
}
