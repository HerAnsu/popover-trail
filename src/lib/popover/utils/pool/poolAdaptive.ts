/**
 * Adaptive Idle Compaction and Drainage Scheduler with Decoupled Timer.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolAdaptive
 */

import { noop } from '../functional';

export interface PoolScheduler {
  schedule(fn: () => void, delayMs: number): () => void;
}

export const defaultPoolScheduler: PoolScheduler = {
  schedule(fn: () => void, delayMs: number): () => void {
    if (typeof setTimeout === 'undefined') return noop;
    const timer = setTimeout(fn, delayMs);
    return () => {
      if (typeof clearTimeout !== 'undefined') clearTimeout(timer);
    };
  },
};

export class AdaptiveDrainController {
  private cancelPending: (() => void) | null = null;
  private readonly drainFn: () => void;
  private readonly timeoutMs: number;
  private readonly scheduler: PoolScheduler;

  constructor(drainFn: () => void, timeoutMs?: number, scheduler = defaultPoolScheduler) {
    this.drainFn = drainFn;
    this.timeoutMs = timeoutMs ?? 0;
    this.scheduler = scheduler;
  }

  notifyAcquire(): void {
    this.cancel();
  }

  notifyRelease(): void {
    if (this.timeoutMs <= 0) return;
    this.cancel();
    this.cancelPending = this.scheduler.schedule(() => {
      this.cancelPending = null;
      this.drainFn();
    }, this.timeoutMs);
  }

  cancel(): void {
    if (this.cancelPending !== null) {
      this.cancelPending();
      this.cancelPending = null;
    }
  }

  dispose(): void {
    this.cancel();
  }
}
