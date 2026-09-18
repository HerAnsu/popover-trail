/**
 * Rehydrated State Application and DAG Synchronization.
 *
 * @module store/slices/persistence/rehydrationApplier
 */

import type { DragOffset, StatePatch } from '../../../types';
import {
  isSafeKey,
  restoreDAGFromState,
  sanitizePersistedOffsets,
} from '../../persistence/persistenceHelpers';
import { parseFloating } from './rehydrationParser';
import { isRecordObject, isNonEmptyString, isArray } from '../../../utils/typeGuards';
import { prop } from '../../../utils/functional';

function buildCleanOffsets<TPopoverKey extends string>(
  rawOffsets: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): Partial<Record<TPopoverKey, DragOffset>> {
  return sanitizePersistedOffsets<TPopoverKey>(rawOffsets, activeKeys);
}

function buildCleanPinnedStates<TPopoverKey extends string>(
  rawPinned: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): Partial<Record<TPopoverKey, boolean>> {
  const pinnedRecord = isRecordObject(rawPinned) ? rawPinned : {};
  const cleanPinned: Partial<Record<TPopoverKey, boolean>> = {};
  for (const key of activeKeys) {
    const val = pinnedRecord[key];
    cleanPinned[key] = typeof val === 'boolean' ? val : true;
  }
  return cleanPinned;
}

function buildCleanZIndexOrder<TPopoverKey extends string>(
  rawOrder: unknown,
  activeKeys: ReadonlySet<TPopoverKey>,
): TPopoverKey[] {
  if (isArray(rawOrder)) {
    const keysLookup: ReadonlySet<string> = activeKeys;
    return rawOrder.filter(
      (k): k is TPopoverKey => isNonEmptyString(k) && isSafeKey(k) && keysLookup.has(k),
    );
  }
  return [...activeKeys];
}

/**
 * Applies parsed state payload to store and restores topological DAG relationships.
 *
 * @example
 * ```ts
 * const restored = applyRehydratedState(parsedPayload, store.setState, popoverDAG);
 * if (restored) {
 *   console.log('State successfully rehydrated');
 * }
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param parsed - Raw parsed object payload from storage.
 * @param set - State updater function to apply reconstructed collections.
 * @param dag - Optional directed acyclic graph instance to restore hierarchy into.
 * @returns True if rehydration was valid and applied, false otherwise.
 */
export function applyRehydratedState<TData, TContext, TPopoverKey extends string>(
  parsed: Record<string, unknown>,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
  dag?: { clear: () => void; addNode: (key: TPopoverKey, parentKey?: TPopoverKey) => void },
): boolean {
  const {
    floating: rawFloating,
    offsets: rawOffsets,
    pinnedStates: rawPinnedStates,
    zIndexOrder: rawZIndexOrder,
  } = parsed;
  if (!isArray(rawFloating)) return false;

  const nextFloating = parseFloating<TData, TPopoverKey>(rawFloating);
  const activeKeys = new Set<TPopoverKey>(nextFloating.map(prop('key')));
  const cleanOffsets = buildCleanOffsets(rawOffsets, activeKeys);
  const cleanPinned = buildCleanPinnedStates(rawPinnedStates, activeKeys);
  const rawZOrder = buildCleanZIndexOrder(rawZIndexOrder, activeKeys);

  restoreDAGFromState(dag, [], nextFloating);
  set({
    floating: nextFloating,
    offsets: cleanOffsets,
    pinnedStates: cleanPinned,
    zIndexOrder: rawZOrder,
  });
  return true;
}
