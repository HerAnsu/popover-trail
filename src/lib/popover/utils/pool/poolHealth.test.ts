import { describe, it, expect } from 'vitest';
import { assessPoolHealth } from './poolHealth';
import type { ObjectPoolMetrics } from './poolTypes';
import { ObjectPool } from './objectPoolCore';
import { globalPoolRegistry } from './poolRegistry';

describe('poolHealth', () => {
  it('reports healthy status for well-utilized pools', () => {
    const metrics: ObjectPoolMetrics = {
      allocated: 10,
      inUse: 2,
      peakInUse: 5,
      hits: 20,
      misses: 2,
      hitRate: 20 / 22,
      available: 8,
      capacity: 10,
    };

    const report = assessPoolHealth(metrics, 0);
    expect(report.status).toBe('healthy');
    expect(report.score).toBe(100);
    expect(report.recommendations).toContain(
      'Pool is operating with optimal zero-allocation efficiency.',
    );
  });

  it('detects high saturation and provides warning', () => {
    const metrics: ObjectPoolMetrics = {
      allocated: 100,
      inUse: 95,
      peakInUse: 95,
      hits: 100,
      misses: 5,
      hitRate: 0.95,
      available: 5,
      capacity: 100,
    };

    const report = assessPoolHealth(metrics, 0);
    expect(report.saturationRate).toBe(0.95);
    expect(report.score).toBeLessThan(100);
    expect(report.recommendations.some((r) => r.includes('saturation'))).toBe(true);
  });

  it('integrates getHealth with ObjectPool and globalPoolRegistry', () => {
    const pool = new ObjectPool(() => ({ x: 0 }), undefined, 5, 20);
    const health = pool.getHealth();
    expect(health.status).toBe('healthy');

    globalPoolRegistry.register('health-test', pool);
    const summary = globalPoolRegistry.getHealthSummary();
    expect(summary.has('health-test')).toBe(true);
    expect(summary.get('health-test')?.status).toBe('healthy');
    globalPoolRegistry.unregister('health-test');
  });
});
