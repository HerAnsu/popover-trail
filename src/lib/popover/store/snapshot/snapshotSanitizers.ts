/**
 * Snapshot Payload and Coordinate Sanitization Helpers.
 *
 * @module snapshotSanitizers
 */

import { SNAPSHOT_VERSION, type PopoverSnapshotData } from './snapshotManagerTypes';
import { isPlainObject } from '../../utils/guards/objectGuards';
import { ZERO_OFFSET } from '../../constants';
import { filterRecord } from '../../utils/cleanObject';

const UNSAFE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function sanitizeOffsets(
  offsets: Record<string, { x: number; y: number }>,
): Record<string, { x: number; y: number }> {
  const result: Record<string, { x: number; y: number }> = {};
  for (const [key, offset] of Object.entries(offsets)) {
    if (UNSAFE_KEYS.has(key)) continue;
    if (offset && typeof offset === 'object') {
      const x = Number.isFinite(offset.x) ? offset.x : 0;
      const y = Number.isFinite(offset.y) ? offset.y : 0;
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
  return filterRecord(payloads, (v) => typeof v !== 'function') as Record<string, TData>;
}

export function isValidSnapshot<TData>(val: unknown): val is PopoverSnapshotData<TData> {
  if (!isPlainObject(val)) return false;
  return (
    val.version === SNAPSHOT_VERSION &&
    typeof val.timestamp === 'number' &&
    typeof val.tabId === 'string' &&
    Array.isArray(val.trailKeys) &&
    Array.isArray(val.pinnedKeys) &&
    typeof val.offsets === 'object' &&
    val.offsets !== null
  );
}
