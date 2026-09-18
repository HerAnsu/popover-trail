import { describe, it, expect } from 'vitest';
import { ResolverTelemetryLog } from './resolverTelemetryLog';
import type { ResolutionMetric } from '../../types';

describe('ResolverTelemetryLog', () => {
  const createMetric = (key: string, durationMs: number, success = true): ResolutionMetric => ({
    key,
    source: 'async',
    durationMs,
    timestamp: Date.now(),
    success,
  });

  it('records metrics and enforces capacity bound with FIFO eviction', () => {
    const log = new ResolverTelemetryLog(3);
    expect(log.isEmpty).toBe(true);

    log.record(createMetric('k1', 10));
    log.record(createMetric('k2', 20));
    log.record(createMetric('k3', 30));
    expect(log.size).toBe(3);

    log.record(createMetric('k4', 40)); // evicts k1
    expect(log.size).toBe(3);

    const recent = log.getRecent();
    expect(recent.map((m) => m.key)).toEqual(['k2', 'k3', 'k4']);
  });

  it('provides getRecent with bounded slice count', () => {
    const log = new ResolverTelemetryLog(5);
    log.record(createMetric('k1', 10));
    log.record(createMetric('k2', 20));
    log.record(createMetric('k3', 30));

    expect(log.getRecent(2).map((m) => m.key)).toEqual(['k2', 'k3']);
    expect(log.getRecent(10).map((m) => m.key)).toEqual(['k1', 'k2', 'k3']);
  });

  it('finds slowest metric via buffer reduction', () => {
    const log = new ResolverTelemetryLog(5);
    expect(log.findSlowest()).toBeUndefined();

    log.record(createMetric('fast', 5));
    log.record(createMetric('slowest', 120));
    log.record(createMetric('medium', 45));

    expect(log.findSlowest()?.key).toBe('slowest');
  });

  it('finds failed metrics via buffer filter', () => {
    const log = new ResolverTelemetryLog(5);
    log.record(createMetric('ok1', 10, true));
    log.record(createMetric('fail1', 20, false));
    log.record(createMetric('ok2', 30, true));
    log.record(createMetric('fail2', 40, false));

    const failures = log.findFailures();
    expect(failures.map((m) => m.key)).toEqual(['fail1', 'fail2']);
  });

  it('provides metrics snapshot and clears history', () => {
    const log = new ResolverTelemetryLog(4);
    log.record(createMetric('k1', 10));
    log.record(createMetric('k2', 20));

    const metrics = log.getMetrics();
    expect(metrics.capacity).toBe(4);
    expect(metrics.size).toBe(2);
    expect(metrics.totalPushes).toBe(2);

    const ro = log.asReadonly();
    expect(ro.size).toBe(2);
    expect(ro.peek()?.key).toBe('k2');

    log.clear();
    expect(log.isEmpty).toBe(true);
    expect(log.size).toBe(0);
  });
});
