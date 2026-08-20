/**
 * RAII-compliant Timed Transition and Lifecycle Scheduler for popover-trail.
 * Manages hover delay timers, exit animations, and cascade cancellation with zero memory leaks.
 *
 * @module store/transitionScheduler
 */

import { type ScopeDisposable, DISPOSE_SYMBOL } from '../utils/disposable';

/**
 * Coordinates and cancels timed transitions across the popover hierarchy.
 */
export class PopoverTransitionScheduler implements ScopeDisposable {
  private readonly hoverTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private readonly exitTimers = new Map<string, ReturnType<typeof setTimeout>>();
  private isDisposed = false;

  /**
   * Schedules a delayed hover-leave close action, automatically cancelling any previous hover timer.
   *
   * @param key - Popover string key.
   * @param delay - Delay in milliseconds before firing callback.
   * @param onComplete - Action to execute upon timer expiration.
   */
  public scheduleHoverLeave(key: string, delay: number, onComplete: () => void): void {
    if (this.isDisposed) return;
    this.cancelHover(key);

    const timer = setTimeout(
      () => {
        this.hoverTimers.delete(key);
        if (!this.isDisposed) {
          onComplete();
        }
      },
      Math.max(0, delay),
    );

    this.hoverTimers.set(key, timer);
  }

  /**
   * Cancels any pending hover leave timer for the given key.
   *
   * @param key - Popover string key.
   */
  public cancelHover(key: string): void {
    const timer = this.hoverTimers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.hoverTimers.delete(key);
    }
  }

  /**
   * Schedules an exit animation timer for the given key.
   *
   * @param key - Popover string key.
   * @param duration - Animation duration in milliseconds.
   * @param onComplete - Action to execute upon animation completion.
   */
  public scheduleExitTransition(key: string, duration: number, onComplete: () => void): void {
    if (this.isDisposed) return;
    this.cancelExit(key);

    const timer = setTimeout(
      () => {
        this.exitTimers.delete(key);
        if (!this.isDisposed) {
          onComplete();
        }
      },
      Math.max(0, duration),
    );

    this.exitTimers.set(key, timer);
  }

  public scheduleExit(key: string, duration: number, onComplete: () => void): void {
    this.scheduleExitTransition(key, duration, onComplete);
  }

  /**
   * Cancels any pending exit animation timer for the given key.
   *
   * @param key - Popover string key.
   */
  public cancelExit(key: string): void {
    const timer = this.exitTimers.get(key);
    if (timer !== undefined) {
      clearTimeout(timer);
      this.exitTimers.delete(key);
    }
  }

  /**
   * Checks if an exit animation timer is currently running for the given key.
   *
   * @param key - Popover string key.
   * @returns True if an exit timer is active.
   */
  public hasActiveExit(key: string): boolean {
    return this.exitTimers.has(key);
  }

  /**
   * Checks if a hover leave timer is currently running for the given key.
   *
   * @param key - Popover string key.
   * @returns True if a hover timer is active.
   */
  public hasActiveHover(key: string): boolean {
    return this.hoverTimers.has(key);
  }

  /**
   * Cancels all timers (hover + exit) for the given key.
   *
   * @param key - Popover string key.
   */
  public cancelAllForKey(key: string): void {
    this.cancelHover(key);
    this.cancelExit(key);
  }

  /**
   * Cancels all timers for a collection of popover keys (e.g. during cascade close).
   *
   * @param keys - Iterable of popover keys.
   */
  public cancelAllForKeys(keys: Iterable<string>): void {
    for (const key of keys) {
      this.cancelAllForKey(key);
    }
  }

  /**
   * Clears all tracked timers across all popovers.
   */
  public clear(): void {
    for (const timer of this.hoverTimers.values()) {
      clearTimeout(timer);
    }
    this.hoverTimers.clear();

    for (const timer of this.exitTimers.values()) {
      clearTimeout(timer);
    }
    this.exitTimers.clear();
  }

  /**
   * ScopeDisposable teardown lifecycle hook.
   */
  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.clear();
  }

  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
