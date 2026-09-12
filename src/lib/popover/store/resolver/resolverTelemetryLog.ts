/**
 * Rolling Diagnostic Telemetry Buffer for Popover Resolution Metrics.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/resolver/resolverTelemetryLog
 */

import type { ResolutionMetric } from '../../types';
import { RingBuffer, type ReadonlyRingBuffer, type RingBufferMetrics } from '../../utils/buffer';

export class ResolverTelemetryLog<TPopoverKey extends string = string> {
  private readonly buffer: RingBuffer<ResolutionMetric<TPopoverKey>>;

  constructor(capacity = 50) {
    this.buffer = new RingBuffer<ResolutionMetric<TPopoverKey>>(Math.max(1, capacity));
  }

  get size(): number {
    return this.buffer.size;
  }

  get isEmpty(): boolean {
    return this.buffer.isEmpty;
  }

  record(metric: ResolutionMetric<TPopoverKey>): void {
    this.buffer.push(metric);
  }

  getMetrics(): RingBufferMetrics {
    return this.buffer.getMetrics();
  }

  asReadonly(): ReadonlyRingBuffer<ResolutionMetric<TPopoverKey>> {
    return this.buffer.asReadonly();
  }

  getRecent(count?: number): ResolutionMetric<TPopoverKey>[] {
    if (count === undefined || count >= this.buffer.size) {
      return this.buffer.toArray();
    }
    return this.buffer.slice(this.buffer.size - count);
  }

  findSlowest(): ResolutionMetric<TPopoverKey> | undefined {
    return this.buffer.reduce<ResolutionMetric<TPopoverKey> | undefined>(
      (slowest, curr) => (!slowest || curr.durationMs > slowest.durationMs ? curr : slowest),
      undefined,
    );
  }

  findFailures(): ResolutionMetric<TPopoverKey>[] {
    return this.buffer.filter((m) => !m.success).toArray();
  }

  clear(): void {
    this.buffer.clear();
  }
}
