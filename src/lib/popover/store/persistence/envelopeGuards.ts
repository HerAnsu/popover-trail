/**
 * Type Guards and Key Validation for Persisted Envelopes.
 *
 * @module store/persistence/envelopeGuards
 */

import type { PersistedEnvelope } from './persistenceTypes';
import { isNonEmptyString, isRecordObject, isArray } from '../../utils/typeGuards';
import { isUnsafeKey } from '../../utils/safeKeys';

/**
 * Validates whether a key string is non-empty and safe against prototype pollution.
 */
export function isSafeKey<K extends string = string>(key: unknown): key is K {
  return isNonEmptyString(key) && !isUnsafeKey(key);
}

/**
 * Type guard verifying if value conforms to PersistedEnvelope shape.
 */
export function isPersistedEnvelope(val: unknown): val is PersistedEnvelope {
  if (!isRecordObject(val)) return false;
  return (
    typeof val.schemaVersion === 'number' &&
    isArray(val.trail) &&
    isArray(val.floating) &&
    isRecordObject(val.offsets) &&
    isArray(val.zIndexOrder)
  );
}
