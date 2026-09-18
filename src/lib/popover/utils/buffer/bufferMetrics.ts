/**
 * Bounded Ring Buffer Telemetry & Operational Metrics Tracker.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferMetrics
 */

import type { BufferCapacity } from './bufferBranded';

export interface RingBufferMetrics {
  readonly capacity: BufferCapacity;
  readonly size: number;
  readonly totalPushes: number;
  readonly totalEvictions: number;
  readonly totalPops: number;
  readonly totalShifts: number;
  readonly totalUnshifts: number;
  readonly evictionRate: number;
  readonly peakSize: number;
  readonly isFull: boolean;
  readonly isEmpty: boolean;
}

export class BufferMetricsTracker {
  private pushes = 0;
  private evictions = 0;
  private pops = 0;
  private shifts = 0;
  private unshifts = 0;
  private peak = 0;

  recordPush(isEvicted: boolean, newCount: number): void {
    this.pushes++;
    if (isEvicted) this.evictions++;
    if (newCount > this.peak) this.peak = newCount;
  }

  recordUnshift(isEvicted: boolean, newCount: number): void {
    this.unshifts++;
    if (isEvicted) this.evictions++;
    if (newCount > this.peak) this.peak = newCount;
  }

  recordPop(): void {
    this.pops++;
  }
  recordShift(): void {
    this.shifts++;
  }

  getSnapshot(size: number, capacity: BufferCapacity): RingBufferMetrics {
    const totalOps = this.pushes + this.unshifts;
    return {
      capacity,
      size,
      totalPushes: this.pushes,
      totalEvictions: this.evictions,
      totalPops: this.pops,
      totalShifts: this.shifts,
      totalUnshifts: this.unshifts,
      evictionRate: totalOps > 0 ? this.evictions / totalOps : 0,
      peakSize: this.peak,
      isFull: size === capacity,
      isEmpty: size === 0,
    };
  }

  reset(): void {
    this.pushes = 0;
    this.evictions = 0;
    this.pops = 0;
    this.shifts = 0;
    this.unshifts = 0;
    this.peak = 0;
  }
}
