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
  const clean: TrailEntry<TData, TPopoverKey> = { ...entry };
  delete clean.dataPromise;
  delete clean.onError;
  delete clean.onPin;
  delete clean.onClose;
  delete clean.onOpen;
  return clean;
}

/**
 * Sanitizes trail entries by stripping out ephemeral callbacks (`onOpen`, `onClose`, `onPin`, `onError`)
 * and un-serializable asynchronous promises (`dataPromise`). Also verifies key safety.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param entries - Readonly list of trail entries to clean.
 * @returns Sanitized clone of valid entries ready for persistent serialization.
 *
 * @example
 * ```typescript
 * const cleanEntries = sanitizePersistedEntries(store.getState().trail);
 * ```
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
 * Sanitizes persisted coordinate offsets, ensuring all coordinates are finite numbers
 * and keys are safe against prototype pollution.
 *
 * @template TPopoverKey - Registered string key identifiers.
 * @param offsets - Raw offsets record to sanitize.
 * @param allowedKeys - Optional set of allowed active keys to restrict inclusion.
 * @returns Cleaned record of valid drag offsets.
 *
 * @example
 * ```typescript
 * const safeOffsets = sanitizePersistedOffsets(rawOffsets);
 * ```
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
