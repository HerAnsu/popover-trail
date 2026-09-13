/**
 * Snapshot Extraction and Step-by-Step Equality Checking Helpers.
 *
 * @module historySnapshotHelpers
 */

import type { DragOffset } from '../../types';
import { EMPTY_ARRAY, ZERO_OFFSET, emptyRecord } from '../hydration/storeDefaults';
import { shallowEqual } from '../../utils/equality';
import type { HistorySnapshot } from './historyTypes';

export function cloneNonEmptyRecord<K extends string = string, V = unknown>(
  record?: Readonly<Partial<Record<K, V>>>,
): Readonly<Partial<Record<K, V>>> {
  if (!record || Object.keys(record).length === 0) {
    return emptyRecord<K, V>();
  }
  return { ...record };
}

export function cloneNonEmptyArray<T>(arr?: readonly T[]): readonly T[] {
  if (!arr || arr.length === 0) return EMPTY_ARRAY;
  return [...arr];
}

export function areKeysEqual<T>(a: readonly T[], b: readonly T[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) return false;
  }
  return true;
}

function isDragOffset(val: unknown): val is DragOffset {
  return typeof val === 'object' && val !== null && 'x' in val && 'y' in val;
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

export function areSnapshotsEqual<TData, TPopoverKey extends string>(
  a: HistorySnapshot<TData, TPopoverKey>,
  b: HistorySnapshot<TData, TPopoverKey>,
): boolean {
  if (a.ownerId !== b.ownerId) return false;
  if (
    a.trail !== b.trail &&
    !areKeysEqual(
      a.trail.map((e) => e.key),
      b.trail.map((e) => e.key),
    )
  )
    return false;
  if (
    a.floating !== b.floating &&
    !areKeysEqual(
      a.floating.map((e) => e.key),
      b.floating.map((e) => e.key),
    )
  )
    return false;
  if (!areKeysEqual(a.zIndexOrder, b.zIndexOrder)) return false;
  if (!areOffsetsEqual(a.offsets, b.offsets)) return false;
  if (!arePinnedStatesEqual(a.pinnedStates, b.pinnedStates)) return false;
  return true;
}
