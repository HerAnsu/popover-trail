/**
 * Serialization & Rehydration Schemas for Popover Trail Persistence.
 *
 * @module store/slices/persistence/serialization
 */

import { CURRENT_SCHEMA_VERSION } from '../../persistence/persistenceCore';
import {
  sanitizePersistedEntries,
  sanitizePersistedOffsets,
} from '../../persistence/persistenceHelpers';

export const PERSIST_SCHEMA_VERSION = CURRENT_SCHEMA_VERSION;
export { sanitizePersistedEntries, sanitizePersistedOffsets };
