/**
 * Transition Scheduler Key Cancellation Helpers.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module store/scheduler/transitionSchedulerHelpers
 */

import type { KeyedTimerPool } from '../../utils/keyedTimerPool';

export function cancelKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  key: string,
): void {
  hover.cancel(key);
  exit.cancel(key);
}

export function cancelMultipleKeyTransitions(
  hover: KeyedTimerPool<string>,
  exit: KeyedTimerPool<string>,
  keys: Iterable<string>,
): void {
  for (const key of keys) {
    cancelKeyTransitions(hover, exit, key);
  }
}
