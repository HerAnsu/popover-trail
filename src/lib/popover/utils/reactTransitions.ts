/**
 * React Transition Scheduler Adapter for popover-trail.
 * The only module bridging the store engine and React's concurrent scheduling:
 * the composition root injects this into store deps, keeping the state layer
 * itself framework-free.
 *
 * @module utils/reactTransitions
 */

import { startTransition } from 'react';

/**
 * Schedules `callback` inside React's `startTransition` (concurrent low-priority render).
 *
 * @param callback - State mutation to schedule as a non-blocking transition.
 */
export function reactScheduleTransition(callback: () => void): void {
  startTransition(callback);
}
