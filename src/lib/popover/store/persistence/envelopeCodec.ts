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
 * Encodes current popover state into a serializable PersistedEnvelope.
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
 * Safely decodes a raw JSON string into a validated PersistedEnvelope.
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
