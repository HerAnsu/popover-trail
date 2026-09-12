/**
 * Timed Batch Transition Scheduler.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/scheduler/transitionBatchScheduler
 */

import { KeyedTimerPool } from '../../utils/keyedTimerPool';
import type { TransitionBatchHandle } from './transitionSchedulerTypes';

let batchSeq = 0;

export class TransitionBatchScheduler {
  private readonly timers = new KeyedTimerPool<number>();
  private isDisposed = false;

  get size(): number {
    return this.timers.size;
  }

  schedule(duration: number, onComplete: () => void): TransitionBatchHandle {
    const batchId = ++batchSeq;
    if (this.isDisposed) return { batchId };
    this.timers.schedule(batchId, duration, onComplete);
    return { batchId };
  }

  cancel(handle: TransitionBatchHandle): void {
    this.timers.cancel(handle.batchId);
  }

  clear(): void {
    this.timers.cancelAll();
  }

  dispose(): void {
    this.isDisposed = true;
    this.timers.dispose();
  }
}
