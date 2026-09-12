/**
 * Teardown Execution & State Patch Application for Popover Trail.
 *
 * @module store/slices/trail/teardownExecution
 */

import type { TrailEntry } from '../../../types';
import { getCleanupStatePatch } from '../../reducers/stack';
import { TRANSITION_STATUS_UNMOUNTING } from '../../../constants';
import type { Effect } from '../../effects';
import type { SliceContext } from '../context';
import { collectClosedEntryEffects } from './teardownHelpers';

const mapToUnmounting = <TData, TPopoverKey extends string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  removedKeys: ReadonlySet<TPopoverKey>,
) =>
  list.map((entry) =>
    removedKeys.has(entry.key)
      ? { ...entry, transitionStatus: TRANSITION_STATUS_UNMOUNTING }
      : entry,
  );

/**
 * Creates the low-level teardown execution runner.
 */
export function createTrailTeardownExecution<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { dispatchEffects } = deps;

  const applyUnmountingState = (removedKeys: ReadonlySet<TPopoverKey>): void => {
    if (removedKeys.size === 0) return;
    set(({ floating, trail }) => ({
      floating: mapToUnmounting(floating, removedKeys),
      trail: mapToUnmounting(trail, removedKeys),
    }));
  };

  const executeTeardown = (removedKeys: ReadonlySet<TPopoverKey>): void => {
    const currentState = get();
    const { floating, trail, pinnedStates, offsets, zIndexOrder, nestedHydrationRequestCounters } =
      currentState;

    const isRetained = ({ key }: TrailEntry<TData, TPopoverKey>) => !removedKeys.has(key);
    const nextFloating = floating.filter(isRetained);
    const nextTrail = trail.filter(isRetained);
    const nextPinnedStates = { ...pinnedStates };

    const closedEffects = collectClosedEntryEffects<TData, TPopoverKey, TContext>(
      removedKeys,
      nextFloating,
      nextTrail,
      nextPinnedStates,
    );

    const cleanupPatch = getCleanupStatePatch(
      nextFloating,
      nextTrail,
      offsets,
      zIndexOrder,
      nextPinnedStates,
      nestedHydrationRequestCounters,
    );

    set({ floating: nextFloating, trail: nextTrail, ...cleanupPatch });

    const keys = [...removedKeys];
    const finalEffects: Effect<TData, TPopoverKey, TContext>[] = [
      ...closedEffects,
      { type: 'EMIT_EVENT', event: { type: 'close', keys, key: keys[0] } },
    ];

    if (nextFloating.length === 0 && nextTrail.length === 0) {
      finalEffects.push({ type: 'RESET_STORE' }, { type: 'CLEAR_DAG' });
    }

    dispatchEffects(finalEffects);
  };

  return {
    applyUnmountingState,
    executeTeardown,
  };
}
