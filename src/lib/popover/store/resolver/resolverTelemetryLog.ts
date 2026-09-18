/**
 * Rolling Diagnostic Telemetry Buffer for Popover Resolution Metrics.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/resolver/resolverTelemetryLog
 */

import type { ResolutionMetric } from '../../types';
import { RingBuffer, type ReadonlyRingBuffer, type RingBufferMetrics } from '../../utils/buffer';
import { DISPOSE_SYMBOL, type ScopeDisposable } from '../../utils/resource/disposableTypes';

/**
 * Rolling diagnostic telemetry buffer storing recent popover resolution performance metrics.
 *
 * Uses a fixed-capacity ring buffer to guarantee $O(1)$ metric ingestion and bounded memory usage.
 * Offers query methods to inspect recent metrics, diagnose slow resolutions, and filter failures.
 *
 * @template TPopoverKey - Popover key identifier type.
 *
 * @example
 * ```typescript
 * const telemetryLog = new ResolverTelemetryLog<string>(100);
 * telemetryLog.record(metric);
 *
 * const slowest = telemetryLog.findSlowest();
 * const failures = telemetryLog.findFailures();
 * ```
 */
export class ResolverTelemetryLog<TPopoverKey extends string = string> implements ScopeDisposable {
  private readonly buffer: RingBuffer<ResolutionMetric<TPopoverKey>>;

  /**
   * Initializes the rolling telemetry buffer with fixed capacity.
   *
   * @param capacity - Maximum number of metrics to retain (default: 50).
   */
  constructor(capacity = 50) {
    this.buffer = new RingBuffer<ResolutionMetric<TPopoverKey>>(Math.max(1, capacity));
  }

  /**
   * Current number of metrics retained in the buffer.
   */
  get size(): number {
    return this.buffer.size;
  }

  /**
   * True if no metrics have been recorded yet.
   */
  get isEmpty(): boolean {
    return this.buffer.isEmpty;
  }

  /**
   * Records a resolution metric into the ring buffer, overwriting the oldest entry if at capacity.
   *
   * @param metric - Metric data object to append.
   */
  record(metric: ResolutionMetric<TPopoverKey>): void {
    this.buffer.push(metric);
  }

  /**
   * Returns ring buffer capacity and usage metrics.
   *
   * @returns Telemetry metrics regarding ring buffer utilization.
   */
  getMetrics(): RingBufferMetrics {
    return this.buffer.getMetrics();
  }

  /**
   * Returns an immutable readonly view of the telemetry buffer.
   *
   * @returns Readonly ring buffer interface.
   */
  asReadonly(): ReadonlyRingBuffer<ResolutionMetric<TPopoverKey>> {
    return this.buffer.asReadonly();
  }

  /**
   * Retrieves the most recent N metrics in chronological order.
   *
   * @param count - Number of recent metrics to fetch (default: all).
   * @returns Array of resolution metrics.
   *
   * @example
   * ```typescript
   * const lastTen = telemetryLog.getRecent(10);
   * ```
   */
  getRecent(count?: number): ResolutionMetric<TPopoverKey>[] {
    if (count === undefined || count >= this.buffer.size) {
      return this.buffer.toArray();
    }
    return this.buffer.takeLast(count);
  }

  /**
   * Fast count of failed resolution attempts without allocating intermediate arrays.
   */
  countFailures(): number {
    return this.buffer.count((m) => !m.success);
  }

  /**
   * Fast count of successful resolution attempts without allocating intermediate arrays.
   */
  countSuccesses(): number {
    return this.buffer.count((m) => m.success);
  }

  /**
   * Iterates sliding windows of recent telemetry metrics for trend analysis.
   */
  windows(size: number, step?: number): IterableIterator<ResolutionMetric<TPopoverKey>[]> {
    return this.buffer.windows(size, step);
  }

  /**
   * Finds the metric with the highest resolution latency (`durationMs`).
   *
   * @returns Slowest recorded metric or `undefined` if empty.
   *
   * @example
   * ```typescript
   * const bottleneck = telemetryLog.findSlowest();
   * ```
   */
  findSlowest(): ResolutionMetric<TPopoverKey> | undefined {
    return this.buffer.reduce<ResolutionMetric<TPopoverKey> | undefined>(
      (slowest, curr) => (!slowest || curr.durationMs > slowest.durationMs ? curr : slowest),
      undefined,
    );
  }

  /**
   * Returns all recorded metrics that ended with a failure (`success === false`).
   *
   * @returns Array of failed resolution metrics.
   *
   * @example
   * ```typescript
   * const failures = telemetryLog.findFailures();
   * ```
   */
  findFailures(): ResolutionMetric<TPopoverKey>[] {
    return this.buffer.filter((m) => !m.success).toArray();
  }

  /**
   * Clears all metrics from the buffer.
   */
  clear(): void {
    this.buffer.clear();
  }

  /**
   * Disposes the telemetry log, clearing all stored metrics.
   */
  dispose(): void {
    this.clear();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
