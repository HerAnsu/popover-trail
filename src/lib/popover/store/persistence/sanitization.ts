/**
 * Entry and Drag Offset Sanitization Engine for Persistence.
 *
 * @module store/persistence/sanitization
 */

import type { DragOffset, TrailEntry } from '../../types';
import { isSafeKey } from './envelopeGuards';
import { isFinitePoint, isRecordObject } from '../../utils/typeGuards';

function cleanEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  if (!entry.dataPromise && !entry.onError && !entry.onPin && !entry.onClose && !entry.onOpen) {
    return entry;
  }
  const clean: TrailEntry<TData, TPopoverKey> = {
    ...entry,
    dataPromise: undefined,
    onError: undefined,
    onPin: undefined,
    onClose: undefined,
    onOpen: undefined,
  };
  return clean;
}

/**
 * Sanitizes trail entries removing ephemeral callbacks and un-serializable promises.
 */
export function sanitizePersistedEntries<TData, TPopoverKey extends string = string>(
  entries: readonly TrailEntry<TData, TPopoverKey>[],
): TrailEntry<TData, TPopoverKey>[] {
  const result: TrailEntry<TData, TPopoverKey>[] = [];
  for (const entry of entries) {
    if (entry && isSafeKey(entry.key)) {
      result.push(cleanEntry(entry));
    }
  }
  return result;
}

/**
 * Sanitizes persisted offsets ensuring finite coordinates and key safety.
 */
export function sanitizePersistedOffsets<TPopoverKey extends string = string>(
  offsets: unknown,
  allowedKeys?: ReadonlySet<string>,
): Partial<Record<TPopoverKey, DragOffset>> {
  if (!isRecordObject(offsets)) return {};
  const result: Partial<Record<TPopoverKey, DragOffset>> = {};
  for (const key in offsets) {
    if (Object.hasOwn(offsets, key) && isSafeKey<TPopoverKey>(key)) {
      if (allowedKeys && !allowedKeys.has(key)) continue;
      const offset = offsets[key];
      if (isFinitePoint(offset)) {
        result[key] = { x: offset.x, y: offset.y };
      }
    }
  }
  return result;
}
