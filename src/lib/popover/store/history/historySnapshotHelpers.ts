/**
 * Snapshot Extraction and Step-by-Step Equality Checking Helpers.
 *
 * @module historySnapshotHelpers
 */

import { EMPTY_ARRAY, ZERO_OFFSET, emptyRecord } from '../hydration/storeDefaults';
import { shallowEqual, shallowEqualArray } from '../../utils/equality';
import { isEmptyRecord } from '../../utils/cleanObject';
import { isDragOffset } from '../../utils/guards/geometryGuards';
import { and, prop } from '../../utils/functional';
import type { HistorySnapshot } from './historyTypes';

/**
 * Clones a record if non-empty, reusing a frozen empty record singleton otherwise.
 *
 * @template K - String record key type.
 * @template V - Value type.
 * @param record - Optional source record to clone.
 * @returns Shallow copy or static frozen empty record singleton.
 *
 * @example
 * ```typescript
 * const clean = cloneNonEmptyRecord(state.offsets);
 * ```
 */
export function cloneNonEmptyRecord<K extends string = string, V = unknown>(
  record?: Readonly<Partial<Record<K, V>>>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || isEmptyRecord(record)) {
    return emptyRecord<K, V>();
  }
  return { ...record };
}

/**
 * Clones an array if non-empty, reusing a frozen empty array singleton otherwise.
 *
 * @template T - Element type.
 * @param arr - Optional source array to clone.
 * @returns Shallow copy or static frozen empty array singleton.
 *
 * @example
 * ```typescript
 * const clean = cloneNonEmptyArray(state.zIndexOrder);
 * ```
 */
export function cloneNonEmptyArray<T>(arr?: readonly T[]): readonly T[] {
  if (!arr || arr.length === 0) return EMPTY_ARRAY;
  return [...arr];
}

/**
 * Compares two arrays of keys for element-wise shallow equality.
 *
 * @template T - Key type.
 * @param a - First key array.
 * @param b - Second key array.
 * @returns `true` if arrays contain identical items in the same order.
 *
 * @example
 * ```typescript
 * const sameOrder = areKeysEqual(['k1', 'k2'], ['k1', 'k2']); // true
 * ```
 */
export function areKeysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  return shallowEqualArray(a, b);
}

/**
 * Compares two dictionaries of 2D drag offset coordinates for value equality.
 *
 * @param a - First offset dictionary.
 * @param b - Second offset dictionary.
 * @returns `true` if all coordinates are identical across both records.
 *
 * @example
 * ```typescript
 * const sameOffsets = areOffsetsEqual(snapA.offsets, snapB.offsets);
 * ```
 */
export function areOffsetsEqual(a: Record<string, unknown>, b: Record<string, unknown>): boolean {
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  if (aKeys.length !== bKeys.length) return false;
  for (const key of aKeys) {
    const valA = a[key];
    const valB = b[key];
    const offA = isDragOffset(valA) ? valA : ZERO_OFFSET;
    const offB = isDragOffset(valB) ? valB : ZERO_OFFSET;
    if (offA.x !== offB.x || offA.y !== offB.y) return false;
  }
  return true;
}

/**
 * Compares two dictionaries of pinned boolean flags for shallow equality.
 *
 * @param a - First pinned states dictionary.
 * @param b - Second pinned states dictionary.
 * @returns `true` if both dictionaries have identical pinned keys and boolean values.
 *
 * @example
 * ```typescript
 * const samePins = arePinnedStatesEqual(snapA.pinnedStates, snapB.pinnedStates);
 * ```
 */
export function arePinnedStatesEqual(
  a: Record<string, unknown>,
  b: Record<string, unknown>,
): boolean {
  return shallowEqual(a, b);
}

function areEntriesKeyEqual(
  aList: readonly { readonly key: string }[],
  bList: readonly { readonly key: string }[],
): boolean {
  return (
    aList === bList ||
    shallowEqualArray(
      aList.map(prop('key')),
      bList.map(prop('key')),
    )
  );
}

/**
 * Evaluates whether two history state snapshots represent identical UI configurations.
 *
 * @remarks
 * Performs short-circuiting equality checks across:
 * 1. Owner ID
 * 2. Trail entry key order
 * 3. Floating entry key order
 * 4. Z-index stacking order
 * 5. Spatial drag coordinates
 * 6. Pin toggle states
 *
 * @template TData - Type of data payload associated with popover entries.
 * @template TPopoverKey - Branded or string type of popover key identifiers.
 * @param a - First snapshot.
 * @param b - Second snapshot.
 * @returns `true` if snapshots are functionally equivalent; `false` otherwise.
 *
 * @example
 * ```typescript
 * if (!areSnapshotsEqual(currentSnapshot, previousSnapshot)) {
 *   history.push(currentSnapshot);
 * }
 * ```
 */
export function areSnapshotsEqual<TData, TPopoverKey extends string>(
  a: HistorySnapshot<TData, TPopoverKey>,
  b: HistorySnapshot<TData, TPopoverKey>,
): boolean {
  const matchSnapshot = and(
    () => a.ownerId === b.ownerId,
    () => areEntriesKeyEqual(a.trail, b.trail),
    () => areEntriesKeyEqual(a.floating, b.floating),
    () => areKeysEqual(a.zIndexOrder, b.zIndexOrder),
    () => areOffsetsEqual(a.offsets, b.offsets),
    () => arePinnedStatesEqual(a.pinnedStates, b.pinnedStates),
  );
  return matchSnapshot(undefined);
}
