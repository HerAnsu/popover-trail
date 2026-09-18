/**
 * Envelope Parsing Helpers with Safe Prototype Property Filtering.
 *
 * @module store/persistence/envelopeParsers
 */

import type { TrailEntry } from '../../types';
import { isRecordObject, isArray } from '../../utils/typeGuards';
import { isSafeKey } from './envelopeGuards';

function isEntryCandidate<TData, TPopoverKey extends string>(
  item: unknown,
): item is TrailEntry<TData, TPopoverKey> {
  return isRecordObject(item) && isSafeKey<TPopoverKey>(item.key);
}

/**
 * Parses raw trail or floating entry arrays, discarding non-records or entries with prototype-polluted keys.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param raw - Candidate array from deserialized JSON.
 * @returns Filtered array of valid `TrailEntry` objects.
 *
 * @example
 * ```typescript
 * const entries = parseEntryList(parsedJson.trail);
 * ```
 */
export function parseEntryList<TData, TPopoverKey extends string>(
  raw: unknown,
): TrailEntry<TData, TPopoverKey>[] {
  if (!isArray(raw)) return [];
  const result: TrailEntry<TData, TPopoverKey>[] = [];
  for (const item of raw) {
    if (isEntryCandidate<TData, TPopoverKey>(item)) {
      result.push(item);
    }
  }
  return result;
}

/**
 * Parses raw pinned states map, skipping prototype-polluted properties (`__proto__`, `constructor`).
 *
 * @template TPopoverKey - Registered string key identifiers.
 * @param raw - Candidate object from deserialized JSON.
 * @returns Cleaned record of boolean pinned states.
 *
 * @example
 * ```typescript
 * const pinned = parsePinnedStates(parsedJson.pinnedStates);
 * ```
 */
export function parsePinnedStates<TPopoverKey extends string>(
  raw: unknown,
): Partial<Record<TPopoverKey, boolean>> {
  if (!isRecordObject(raw)) return {};
  const pinned: Partial<Record<TPopoverKey, boolean>> = {};
  for (const k in raw) {
    if (Object.hasOwn(raw, k) && isSafeKey<TPopoverKey>(k)) {
      pinned[k] = Boolean(raw[k]);
    }
  }
  return pinned;
}

/**
 * Parses raw z-index stacking order array, safely discarding unsafe strings or non-safe keys.
 *
 * @template TPopoverKey - Registered string key identifiers.
 * @param raw - Candidate array from deserialized JSON.
 * @returns Cleaned array of valid popover keys in stacking order.
 *
 * @example
 * ```typescript
 * const zIndex = parseZIndexOrder(parsedJson.zIndexOrder);
 * ```
 */
export function parseZIndexOrder<TPopoverKey extends string>(raw: unknown): TPopoverKey[] {
  if (!isArray(raw)) return [];
  const order: TPopoverKey[] = [];
  for (const item of raw) {
    if (isSafeKey<TPopoverKey>(item)) {
      order.push(item);
    }
  }
  return order;
}
