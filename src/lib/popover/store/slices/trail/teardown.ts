/**
 * Trail Teardown Scheduling Runner for popover-trail.
 * Orchestrates exit animations, abort signals, and asynchronous removal batching.
 *
 * @module store/slices/trail/teardown
 */

import type { SliceContext } from '../context';
import type { Effect } from '../../effects';
import { resolveMaxExitDuration } from './teardownHelpers';
import { createTrailTeardownExecution } from './teardownExecution';

/**
 * Creates the Trail Teardown scheduling runner.
 *
 * @example
 * ```ts
 * const runner = createTrailTeardownRunner(ctx);
 * runner.closeByTargetKeys(new Set(['card-1']), true);
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Unified slice context container with Zustand accessors.
 * @returns Object exposing `closeByTargetKeys` runner method.
 */
export function createTrailTeardownRunner<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { get, deps } = ctx;
  const { findEntryByKey, dispatchEffects } = deps;

  const { applyUnmountingState, executeTeardown } = createTrailTeardownExecution(ctx);

  const scheduleTeardown = (
    removedKeys: ReadonlySet<TPopoverKey>,
    forceImmediate = false,
  ): void => {
    if (removedKeys.size === 0) return;
    const { exitTransitionDuration } = get();
    const duration = forceImmediate
      ? 0
      : resolveMaxExitDuration(removedKeys, exitTransitionDuration, findEntryByKey);

    applyUnmountingState(removedKeys);

    const runTeardown = () => executeTeardown(removedKeys);
    if (duration <= 0) {
      runTeardown();
    } else {
      dispatchEffects([
        {
          type: 'SCHEDULE_BATCH_TIMER',
          duration,
          onComplete: runTeardown,
        },
      ]);
    }
  };

  return {
    closeByTargetKeys: (
      removedKeys: Set<TPopoverKey>,
      pushHistory: boolean,
      forceImmediate = false,
    ) => {
      if (removedKeys.size === 0) return;
      const keyArray = [...removedKeys];
      const effects: Effect<TData, TPopoverKey, TContext>[] = [];
      if (pushHistory) {
        effects.push({ type: 'RECORD_HISTORY_SNAPSHOT', state: get() });
      }
      effects.push(
        { type: 'ABORT_IN_FLIGHT', keys: keyArray },
        { type: 'CANCEL_TIMERS', keys: keyArray },
      );
      dispatchEffects(effects);

      scheduleTeardown(removedKeys, forceImmediate);
    },
  };
}
