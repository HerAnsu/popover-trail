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

export function cloneNonEmptyRecord<K extends string = string, V = unknown>(
  record?: Readonly<Partial<Record<K, V>>>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || isEmptyRecord(record)) {
    return emptyRecord<K, V>();
  }
  return { ...record };
}

export function cloneNonEmptyArray<T>(arr?: readonly T[]): readonly T[] {
  if (!arr || arr.length === 0) return EMPTY_ARRAY;
  return [...arr];
}

export function areKeysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  return shallowEqualArray(a, b);
}

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
