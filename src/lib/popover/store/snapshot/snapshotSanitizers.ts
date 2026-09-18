/**
 * Snapshot Payload and Coordinate Sanitization Helpers.
 *
 * @module snapshotSanitizers
 */

import { SNAPSHOT_VERSION, type PopoverSnapshotData } from './snapshotManagerTypes';
import { isPlainObject } from '../../utils/guards/objectGuards';
import { isArray } from '../../utils/guards/arrayGuards';
import { ZERO_OFFSET } from '../../constants';
import { filterObject } from '../../utils/cleanObject';

import { isUnsafeKey } from '../../utils/safeKeys';
import { toFiniteNumber } from '../../utils/math';

/**
 * Sanitizes coordinate offsets map, ensuring keys are safe and coordinate values are finite numbers.
 *
 * @param offsets - Raw map of keys to coordinate vectors { x, y }.
 * @returns Cleaned record with finite numerical coordinates.
 *
 * @example
 * ```typescript
 * const clean = sanitizeOffsets({ 'card-1': { x: 15, y: 25 } });
 * ```
 */
export function sanitizeOffsets(
  offsets: Record<string, { x: number; y: number }>,
): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  for (const [key, offset] of Object.entries(offsets)) {
    if (isUnsafeKey(key)) continue;
    if (offset && typeof offset === 'object') {
      const x = toFiniteNumber(offset.x);
      const y = toFiniteNumber(offset.y);
      result[key] = x === 0 && y === 0 ? ZERO_OFFSET : { x, y };
    } else {
      result[key] = ZERO_OFFSET;
    }
  }
  return result;
}

/**
 * Strips un-serializable values (functions, null, undefined) from snapshot payload dictionary.
 *
 * @template TData - Type of data payload.
 * @param payloads - Optional map of keys to payloads.
 * @returns Cleaned record of payloads or `undefined`.
 *
 * @example
 * ```typescript
 * const clean = sanitizePayloads({ 'card-1': { id: 1 } });
 * ```
 */
export function sanitizePayloads<TData>(
  payloads?: Record<string, TData>,
): Record<string, TData> | undefined {
  if (!payloads || typeof payloads !== 'object') return undefined;
  return filterObject(payloads, (v) => typeof v !== 'function' && v !== null && v !== undefined);
}

/**
 * Validates whether an unknown value conforms to the `PopoverSnapshotData` contract.
 *
 * @template TData - Expected payload data type.
 * @param val - Value to check.
 * @returns `true` if valid `PopoverSnapshotData`.
 *
 * @example
 * ```typescript
 * if (isValidSnapshot(parsed)) {
 *   console.log('Snapshot tabId:', parsed.tabId);
 * }
 * ```
 */
export function isValidSnapshot<TData>(val: unknown): val is PopoverSnapshotData<TData> {
  if (!isPlainObject(val)) return false;
  const { version, timestamp, tabId, trailKeys, pinnedKeys, offsets } =
    val as Partial<PopoverSnapshotData<TData>>;
  return (
    version === SNAPSHOT_VERSION &&
    typeof timestamp === 'number' &&
    typeof tabId === 'string' &&
    isArray(trailKeys) &&
    isArray(pinnedKeys) &&
    typeof offsets === 'object' &&
    offsets !== null
  );
}
