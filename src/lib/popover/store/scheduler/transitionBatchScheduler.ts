/**
 * Timed Batch Transition Scheduler.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/scheduler/transitionBatchScheduler
 */

import { KeyedTimerPool } from '../../utils/keyedTimerPool';
import type { TransitionBatchHandle } from './transitionSchedulerTypes';

let batchSeq = 0;

/**
 * Scheduler for tracking and cancelling batch transition timers.
 */
export class TransitionBatchScheduler {
  private readonly timers = new KeyedTimerPool<number>();
  private isDisposed = false;

  /** Total number of currently active batch timers. */
  get size(): number {
    return this.timers.size;
  }

  /**
   * Schedules a delayed batch transition execution.
   *
   * @param duration - Timer delay in milliseconds.
   * @param onComplete - Callback executed upon completion.
   * @returns Handle containing the allocated batch identifier.
   */
  schedule(duration: number, onComplete: () => void): TransitionBatchHandle {
    const batchId = ++batchSeq;
    if (this.isDisposed) return { batchId };
    this.timers.schedule(batchId, duration, onComplete);
    return { batchId };
  }

  /**
   * Cancels a pending scheduled batch timer.
   *
   * @param handle - Transition batch handle to cancel.
   */
  cancel(handle: TransitionBatchHandle): void {
    this.timers.cancel(handle.batchId);
  }

  /** Clears and cancels all pending batch timers. */
  clear(): void {
    this.timers.cancelAll();
  }

  /** Disposes the scheduler and cancels all active batch timers. */
  dispose(): void {
    this.isDisposed = true;
    this.timers.dispose();
  }
}
