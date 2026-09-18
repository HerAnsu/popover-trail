/**
 * Type Guards and Key Validation for Persisted Envelopes.
 *
 * @module store/persistence/envelopeGuards
 */

import type { PersistedEnvelope } from './persistenceTypes';
import { isNonEmptyString, isRecordObject, isArray } from '../../utils/typeGuards';
import { isUnsafeKey } from '../../utils/safeKeys';

/**
 * Validates whether a key string is non-empty and safe against prototype pollution attacks.
 * Blocks dangerous property names such as `__proto__`, `constructor`, and `prototype`.
 *
 * @template K - Validated key type.
 * @param key - Candidate key to check.
 * @returns `true` if key is a non-empty string and not a forbidden prototype property.
 *
 * @example
 * ```typescript
 * isSafeKey('popover-1'); // true
 * isSafeKey('__proto__'); // false
 * ```
 */
export function isSafeKey<K extends string = string>(key: unknown): key is K {
  return isNonEmptyString(key) && !isUnsafeKey(key);
}

/**
 * Type guard verifying whether an unknown value conforms to the `PersistedEnvelope` schema.
 * Checks for expected structure, arrays, and numeric schema version.
 *
 * @param val - Value to validate.
 * @returns `true` if `val` is a structural match for `PersistedEnvelope`.
 *
 * @example
 * ```typescript
 * if (isPersistedEnvelope(data)) {
 *   console.log('Valid persisted envelope version:', data.schemaVersion);
 * }
 * ```
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
