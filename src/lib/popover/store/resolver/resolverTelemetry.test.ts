import { describe, it, expect, vi } from 'vitest';
import {
  getPerformanceTimestamp,
  recordResolutionMetric,
  type MetricDispatcher,
} from './resolverTelemetry';

describe('resolver/resolverTelemetry', () => {
  it('returns valid numeric high-resolution timestamp', () => {
    const ts = getPerformanceTimestamp();
    expect(typeof ts).toBe('number');
    expect(Number.isFinite(ts)).toBe(true);
    expect(ts).toBeGreaterThan(0);
  });

  it('records resolution metric and dispatches resolve_perf store event', () => {
    const listener = vi.fn();
    const eventListeners = new Set([listener]);

    const deps: MetricDispatcher = {
      eventListeners,
      eventBus: undefined,
    };

    const start = getPerformanceTimestamp() - 15;
    recordResolutionMetric(deps, 'card-1', 'async', start, true);

    expect(listener).toHaveBeenCalledTimes(1);
    const event = listener.mock.calls[0]?.[0];
    expect(event).toMatchObject({
      type: 'resolve_perf',
      metric: {
        key: 'card-1',
        source: 'async',
        success: true,
      },
    });
    expect(event.metric.durationMs).toBeGreaterThanOrEqual(0);
  });

  it('records failed resolution metrics with attached error', () => {
    const listener = vi.fn();
    const eventListeners = new Set([listener]);
    const deps: MetricDispatcher = { eventListeners };

    const error = new Error('fetch error');
    recordResolutionMetric(deps, 'card-err', 'sync', getPerformanceTimestamp(), false, error);

    expect(listener).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'resolve_perf',
        metric: expect.objectContaining({
          key: 'card-err',
          source: 'sync',
          success: false,
          error,
        }),
      }),
    );
  });
});
