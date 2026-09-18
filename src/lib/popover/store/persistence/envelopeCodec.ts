/**
 * Encoding and Decoding Codec for Persisted Popover State Envelopes.
 *
 * @module store/persistence/envelopeCodec
 */

import { type Result, Ok, Err } from '../../utils/result';
import { PopoverErrorCode, createPopoverError, type PopoverError } from '../../utils/errors';
import type { PopoverStateData } from '../../types';
import { EMPTY_ARRAY, emptyRecord } from '../storeDefaults';
import { isRecordObject } from '../../utils/typeGuards';
import { CURRENT_SCHEMA_VERSION, type PersistedEnvelope } from './persistenceTypes';
import { safeJsonParse } from './safeJson';
import { sanitizePersistedOffsets } from './sanitization';
import { parseEntryList, parsePinnedStates, parseZIndexOrder } from './envelopeParsers';

export { CURRENT_SCHEMA_VERSION };

/**
 * Encodes current popover store state into a serializable `PersistedEnvelope`.
 * Safely extracts trail entries, floating entries, offsets, pinned states, and z-index ordering.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param state - Current immutable store state snapshot.
 * @returns Serializable envelope object with the current schema version stamped.
 *
 * @example
 * ```typescript
 * const envelope = encodePersistedEnvelope(store.getState());
 * const jsonString = JSON.stringify(envelope);
 * ```
 */
export function encodePersistedEnvelope<TData = unknown, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, unknown, TPopoverKey>,
): PersistedEnvelope<TData, TPopoverKey> {
  return {
    schemaVersion: CURRENT_SCHEMA_VERSION,
    trail: state.trail ?? EMPTY_ARRAY,
    floating: state.floating ?? EMPTY_ARRAY,
    offsets: state.offsets ?? emptyRecord(),
    pinnedStates: state.pinnedStates ?? emptyRecord(),
    zIndexOrder: state.zIndexOrder ?? EMPTY_ARRAY,
    ownerId: state.ownerId,
  };
}

/**
 * Safely decodes and validates a raw JSON string or object into a validated `PersistedEnvelope`.
 * Sanitizes entries, offsets, pinned states, and z-index arrays, returning a Result monad.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param raw - Raw string or parsed object from storage.
 * @returns `Ok(PersistedEnvelope)` if valid; otherwise `Err(PopoverError)`.
 *
 * @example
 * ```typescript
 * const result = decodePersistedEnvelope(localStorage.getItem('popover_state'));
 * if (isOk(result)) {
 *   console.log('Decoded trail length:', result.value.trail.length);
 * }
 * ```
 */
export function decodePersistedEnvelope<TData = unknown, TPopoverKey extends string = string>(
  raw: unknown,
): Result<PersistedEnvelope<TData, TPopoverKey>, PopoverError> {
  const parsed = typeof raw === 'string' ? safeJsonParse(raw, isRecordObject) : raw;

  if (!isRecordObject(parsed)) {
    return Err(
      createPopoverError(
        PopoverErrorCode.PERSIST_FAILED,
        'Invalid state envelope: payload is not an object or JSON could not be parsed',
      ),
    );
  }

  const envelope: PersistedEnvelope<TData, TPopoverKey> = {
    schemaVersion:
      typeof parsed.schemaVersion === 'number' ? parsed.schemaVersion : CURRENT_SCHEMA_VERSION,
    trail: parseEntryList<TData, TPopoverKey>(parsed.trail),
    floating: parseEntryList<TData, TPopoverKey>(parsed.floating),
    offsets: sanitizePersistedOffsets<TPopoverKey>(parsed.offsets),
    pinnedStates: parsePinnedStates<TPopoverKey>(parsed.pinnedStates),
    zIndexOrder: parseZIndexOrder<TPopoverKey>(parsed.zIndexOrder),
    ownerId: typeof parsed.ownerId === 'string' ? parsed.ownerId : null,
  };

  return Ok(envelope);
}
