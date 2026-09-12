/**
 * Floating Entries Rehydration Parser with Prototype Pollution Protection.
 *
 * @module store/slices/persistence/rehydrationParser
 */

import type { TrailEntry } from '../../../types';
import { EMPTY_ARRAY } from '../../storeDefaults';
import { isSafeKey } from '../../persistence/persistenceHelpers';
import { isRecordObject, isNonEmptyString, isNonEmptyArray } from '../../../utils/typeGuards';

/**
 * Raw serialized entry shape with guaranteed string identifier key.
 */
export interface SerializedFloatingItem<TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  readonly [property: string]: unknown;
}

/**
 * Validates whether an unknown item is a safe, rehydratable dictionary with a non-empty key.
 *
 * @param item - Candidate value from persistent storage payload.
 * @returns True if candidate is safe object with non-empty, non-polluting key.
 */
export function isRehydratableFloatingItem<TPopoverKey extends string = string>(
  item: unknown,
): item is SerializedFloatingItem<TPopoverKey> {
  return isRecordObject(item) && isNonEmptyString(item.key) && isSafeKey(item.key);
}

/**
 * Converts a sanitized persistent storage record into an active mounted TrailEntry.
 * Strips volatile closures and promises while restoring canonical default state.
 *
 * @param item - Sanitized storage entry record.
 * @returns Fully populated TrailEntry initialized in mounted success state.
 */
export function toMountedFloatingEntry<TData, TPopoverKey extends string>(
  item: SerializedFloatingItem<TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  const {
    dataPromise: _dp,
    onError: _oe,
    onPin: _op,
    onClose: _oc,
    onOpen: _oo,
    key,
    ...clean
  } = item;

  const entry: TrailEntry<TData, TPopoverKey> = {
    ...clean,
    key,
    status: 'success',
    isLoading: false,
    error: null,
    transitionStatus: 'mounted',
  };

  return entry;
}

/**
 * Parses, sanitizes, and reconstitutes floating entries from raw JSON object payload.
 * Applies prototype pollution protection and strips obsolete runtime handles.
 *
 * @param raw - Candidate serialized entries array from persistent storage.
 * @returns Array of valid, mounted TrailEntry objects or EMPTY_ARRAY singleton.
 */
export function parseFloating<TData, TPopoverKey extends string>(
  raw: unknown,
): readonly TrailEntry<TData, TPopoverKey>[] {
  if (!isNonEmptyArray(raw)) {
    return EMPTY_ARRAY;
  }
  const res: TrailEntry<TData, TPopoverKey>[] = [];
  for (const item of raw) {
    if (isRehydratableFloatingItem<TPopoverKey>(item)) {
      res.push(toMountedFloatingEntry<TData, TPopoverKey>(item));
    }
  }
  return isNonEmptyArray(res) ? res : EMPTY_ARRAY;
}

