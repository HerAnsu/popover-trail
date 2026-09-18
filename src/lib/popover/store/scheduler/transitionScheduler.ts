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

  /**
   * Schedules a delayed batch transition execution.
   *
   * @param duration - Timer delay in milliseconds.
   * @param onComplete - Completion callback.
   * @returns Handle containing the allocated batch identifier.
   */
  scheduleBatch(duration: number, onComplete: () => void): TransitionBatchHandle {
    return this.batches.schedule(duration, onComplete);
  }

  /**
   * Cancels a pending batch transition timer.
   *
   * @param handle - Handle of batch to cancel.
   */
  cancelBatch(handle: TransitionBatchHandle): void {
    this.batches.cancel(handle);
  }

  /**
   * Schedules a delayed callback when the pointer leaves a popover.
   *
   * @param key - Popover key identifier.
   * @param delay - Milliseconds to delay before firing callback.
   * @param onComplete - Callback executed on timeout.
   */
  scheduleHoverLeave(key: string, delay: number, onComplete: () => void): void {
    if (!this.isDisposed) this.hoverTimers.schedule(key, delay, onComplete);
  }

  /**
   * Cancels any pending hover leave timer for the specified popover key.
   *
   * @param key - Popover key identifier.
   */
  cancelHover(key: string): void {
    this.hoverTimers.cancel(key);
  }

  /** Cancels all pending hover leave timers across all popovers. */
  cancelAllHover(): void {
    this.hoverTimers.cancelAll();
  }

  /**
   * Schedules an exit transition timer for a popover key, automatically cancelling pending hover timers.
   *
   * @param key - Popover key identifier.
   * @param duration - Transition animation duration in milliseconds.
   * @param onComplete - Callback executed once transition finishes.
   */
  scheduleExitTransition(key: string, duration: number, onComplete: () => void): void {
    if (this.isDisposed) return;
    this.cancelHover(key);
    this.exitTimers.schedule(key, duration, onComplete);
  }

  /**
   * Schedules an exit transition timer for a popover key.
   *
   * @param key - Popover key identifier.
   * @param duration - Transition animation duration in milliseconds.
   * @param onComplete - Callback executed once transition finishes.
   */
  scheduleExit(key: string, duration: number, onComplete: () => void): void {
    this.scheduleExitTransition(key, duration, onComplete);
  }

  /**
   * Cancels any pending exit transition timer for the specified key.
   *
   * @param key - Popover key identifier.
   */
  cancelExit(key: string): void {
    this.exitTimers.cancel(key);
  }

  /** Cancels all pending exit transition timers. */
  cancelAllExit(): void {
    this.exitTimers.cancelAll();
  }

  /**
   * Evaluates whether an exit transition timer is currently pending for a key.
   *
   * @param key - Popover key identifier.
   */
  hasActiveExit(key: string): boolean {
    return this.exitTimers.has(key);
  }

  /**
   * Evaluates whether a hover leave timer is currently pending for a key.
   *
   * @param key - Popover key identifier.
   */
  hasActiveHover(key: string): boolean {
    return this.hoverTimers.has(key);
  }

  /**
   * Returns `true` if any hover, exit, or batch timers are currently scheduled.
   */
  hasPendingTransitions(): boolean {
    return this.hoverTimers.size > 0 || this.exitTimers.size > 0 || this.batches.size > 0;
  }

  /**
   * Cancels both hover and exit transition timers registered for a specific key.
   *
   * @param key - Popover key identifier.
   */
  cancelAllForKey(key: string): void {
    cancelKeyTransitions(this.hoverTimers, this.exitTimers, key);
  }

  /**
   * Cancels both hover and exit transition timers for multiple popover keys.
   *
   * @param keys - Iterable of popover keys.
   */
  cancelAllForKeys(keys: Iterable<string>): void {
    cancelMultipleKeyTransitions(this.hoverTimers, this.exitTimers, keys);
  }

  /** Clears and cancels all active timers across all pools. */
  clear(): void {
    this.hoverTimers.cancelAll();
    this.exitTimers.cancelAll();
    this.batches.clear();
  }

  /** Disposes the scheduler and cancels all active timer handles. */
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
