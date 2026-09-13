/**
 * Snapshot Payload and Coordinate Sanitization Helpers.
 *
 * @module snapshotSanitizers
 */

import { SNAPSHOT_VERSION, type PopoverSnapshotData } from './snapshotManagerTypes';
import { isPlainObject } from '../../utils/guards/objectGuards';
import { isArray } from '../../utils/guards/arrayGuards';
import { ZERO_OFFSET } from '../../constants';
import { filterRecord } from '../../utils/cleanObject';

import { isUnsafeKey } from '../../utils/safeKeys';
import { toFiniteNumber } from '../../utils/math';

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


export function sanitizePayloads<TData>(
  payloads?: Record<string, TData>,
): Record<string, TData> | undefined {
  if (!payloads || typeof payloads !== 'object') return undefined;
  return filterRecord(payloads, (v) => typeof v !== 'function');
}

export function isValidSnapshot<TData>(val: unknown): val is PopoverSnapshotData<TData> {
  if (!isPlainObject(val)) return false;
  return (
    val.version === SNAPSHOT_VERSION &&
    typeof val.timestamp === 'number' &&
    typeof val.tabId === 'string' &&
    isArray(val.trailKeys) &&
    isArray(val.pinnedKeys) &&
    typeof val.offsets === 'object' &&
    val.offsets !== null
  );
}
