/**
 * Teardown & Transition Helper Functions for Popover Trail.
 *
 * @module store/slices/trail/teardownHelpers
 */

import type { TrailEntry } from '../../../types';
import type { Effect } from '../../effects';
import { collectActiveKeySet } from './dagHelpers';

/**
 * Computes declarative side effects (PRUNE_DAG, NOTIFY_USER_CALLBACK) and updates nextPinnedStates.
 */
export function collectClosedEntryEffects<
  TData,
  TPopoverKey extends string = string,
  TContext = unknown,
>(
  removedKeys: ReadonlySet<TPopoverKey>,
  nextFloating: readonly TrailEntry<TData, TPopoverKey>[],
  nextTrail: readonly TrailEntry<TData, TPopoverKey>[],
  nextPinnedStates: Partial<Record<TPopoverKey, boolean>>,
): Effect<TData, TPopoverKey, TContext>[] {
  const activeKeys = collectActiveKeySet(nextFloating, nextTrail);
  const effects: Effect<TData, TPopoverKey, TContext>[] = [];
  const prunedKeys: TPopoverKey[] = [];

  for (const key of removedKeys) {
    if (!activeKeys.has(key)) {
      nextPinnedStates[key] = false;
      prunedKeys.push(key);
      effects.push({
        type: 'NOTIFY_USER_CALLBACK',
        key,
        callbackType: 'onClose',
      });
    }
  }

  if (prunedKeys.length > 0) {
    effects.unshift({
      type: 'PRUNE_DAG',
      keys: prunedKeys,
    });
  }

  return effects;
}

/**
 * Resolves the longest exit transition duration among the removed entries.
 *
 * @template TData - Resolved popover data payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param removedKeys - Readonly set of popover keys scheduled for unmounting.
 * @param globalDuration - Default global exit transition duration in milliseconds.
 * @param findEntryByKey - Entry lookup function by key.
 * @returns Longest transition delay in milliseconds.
 */
export function resolveMaxExitDuration<TData, TPopoverKey extends string = string>(
  removedKeys: ReadonlySet<TPopoverKey>,
  globalDuration: number,
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
): number {
  let maxDuration = globalDuration;
  for (const key of removedKeys) {
    const entry = findEntryByKey(key);
    const duration = entry?.exitTransitionDuration;
    if (typeof duration === 'number') {
      maxDuration = Math.max(maxDuration, duration);
    }
  }
  return maxDuration;
}
