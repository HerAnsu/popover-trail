/**
 * Transition Scheduler Key Cancellation Helpers.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/scheduler/transitionSchedulerHelpers
 */

import type { KeyedTimerPool } from '../../utils/keyedTimerPool';

/**
 * Cancels any active hover or exit transition timers registered for a specific popover key.
 *
 * @param hover - Keyed timer pool for hover intent delays.
 * @param exit - Keyed timer pool for exit transition durations.
 * @param key - Unique string identifier of the popover.
 *
 * @example
 * ```typescript
 * cancelKeyTransitions(hoverTimers, exitTimers, 'card-1');
 * ```
 */
export function cancelKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  key: string,
): void {
  hover.cancel(key);
  exit.cancel(key);
}

/**
 * Cancels all active hover and exit transition timers for multiple popover keys.
 *
 * @param hover - Keyed timer pool for hover intent delays.
 * @param exit - Keyed timer pool for exit transition durations.
 * @param keys - Iterable collection of popover string keys.
 *
 * @example
 * ```typescript
 * cancelMultipleKeyTransitions(hoverTimers, exitTimers, ['card-1', 'card-2']);
 * ```
 */
export function cancelMultipleKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  keys: Iterable<string>,
): void {
  for (const key of keys) {
    cancelKeyTransitions(hover, exit, key);
  }
}
