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
 * Parses raw trail or floating entry arrays safely discarding prototype-polluted keys.
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
 * Parses raw pinned states safely skipping prototype-polluted properties.
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
 * Parses raw zIndexOrder arrays safely discarding unsafe strings.
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
