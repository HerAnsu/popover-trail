/**
 * RAII-compliant Timed Transition and Lifecycle Scheduler.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/scheduler/transitionScheduler
 */

import { KeyedTimerPool } from '../../utils/keyedTimerPool';
import { DISPOSE_SYMBOL, type ScopeDisposable } from '../../utils/resource';
import { TransitionBatchScheduler } from './transitionBatchScheduler';
import { cancelKeyTransitions, cancelMultipleKeyTransitions } from './transitionSchedulerHelpers';
import type { TransitionBatchHandle } from './transitionSchedulerTypes';

export type { TransitionBatchHandle };

/**
 * RAII-compliant scheduler managing enter, exit, and hover transition timers.
 *
 * @remarks
 * Coordinates micro-delays for hover-intent closing and exit CSS/JS transition animations.
 * Ensures that timers associated with removed or unmounted popovers are cleanly cancelled.
 *
 * @example
 * ```ts
 * const scheduler = new PopoverTransitionScheduler();
 * scheduler.scheduleHoverLeave('card-1', 150, () => {
 *   store.actions.closeByKey('card-1');
 * });
 *
 * // Cancel when user re-enters:
 * scheduler.cancelHover('card-1');
 * ```
 *
 * @template _TPopoverKey - Union of valid popover string keys.
 */
export class PopoverTransitionScheduler<
  _TPopoverKey extends string = string,
> implements ScopeDisposable {
  private readonly hoverTimers = new KeyedTimerPool<string>();
  private readonly exitTimers = new KeyedTimerPool<string>();
  private readonly batches = new TransitionBatchScheduler();
  private isDisposed = false;

  scheduleBatch(duration: number, onComplete: () => void): TransitionBatchHandle {
    return this.batches.schedule(duration, onComplete);
  }

  cancelBatch(handle: TransitionBatchHandle): void {
    this.batches.cancel(handle);
  }

  scheduleHoverLeave(key: string, delay: number, onComplete: () => void): void {
    if (!this.isDisposed) this.hoverTimers.schedule(key, delay, onComplete);
  }

  cancelHover(key: string): void {
    this.hoverTimers.cancel(key);
  }
  cancelAllHover(): void {
    this.hoverTimers.cancelAll();
  }

  scheduleExitTransition(key: string, duration: number, onComplete: () => void): void {
    if (this.isDisposed) return;
    this.cancelHover(key);
    this.exitTimers.schedule(key, duration, onComplete);
  }

  scheduleExit(key: string, duration: number, onComplete: () => void): void {
    this.scheduleExitTransition(key, duration, onComplete);
  }

  cancelExit(key: string): void {
    this.exitTimers.cancel(key);
  }
  cancelAllExit(): void {
    this.exitTimers.cancelAll();
  }
  hasActiveExit(key: string): boolean {
    return this.exitTimers.has(key);
  }
  hasActiveHover(key: string): boolean {
    return this.hoverTimers.has(key);
  }

  hasPendingTransitions(): boolean {
    return this.hoverTimers.size > 0 || this.exitTimers.size > 0 || this.batches.size > 0;
  }

  cancelAllForKey(key: string): void {
    cancelKeyTransitions(this.hoverTimers, this.exitTimers, key);
  }
  cancelAllForKeys(keys: Iterable<string>): void {
    cancelMultipleKeyTransitions(this.hoverTimers, this.exitTimers, keys);
  }

  clear(): void {
    this.hoverTimers.cancelAll();
    this.exitTimers.cancelAll();
    this.batches.clear();
  }

  dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.hoverTimers.dispose();
    this.exitTimers.dispose();
    this.batches.dispose();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
