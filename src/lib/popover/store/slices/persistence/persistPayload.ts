/**
 * Persisted Snapshot Payload Builder for Store Persistence Slice.
 *
 * @module store/slices/persistence/persistPayload
 */

import type {
  DragOffset,
  PopoverPersistConfig,
  PopoverStateData,
  TrailEntry,
} from '../../../types';
import { EMPTY_ARRAY, emptyRecord } from '../../storeDefaults';
import { compactObject, pickKeys } from '../../../utils/cleanObject';
import { prop } from '../../../utils/functional';
import {
  PERSIST_SCHEMA_VERSION,
  sanitizePersistedEntries,
  sanitizePersistedOffsets,
} from './serialization';

export interface PersistedSnapshotPayload<TData = unknown, TPopoverKey extends string = string> {
  readonly version: number;
  readonly timestamp: number;
  readonly tabId: string;
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly offsets: Partial<Record<TPopoverKey, DragOffset>>;
  readonly pinnedStates: Partial<Record<TPopoverKey, boolean>>;
  readonly zIndexOrder: readonly TPopoverKey[];
}

function buildCleanPinned<TPopoverKey extends string>(
  keys: ReadonlySet<TPopoverKey>,
  pinnedStates: Partial<Record<TPopoverKey, boolean>>,
): Partial<Record<TPopoverKey, boolean>> {
  return compactObject(pickKeys(pinnedStates, keys));
}

/**
 * Builds a sanitized, filtered snapshot payload for persistence.
 */
export function buildPersistPayload<TData, TContext, TPopoverKey extends string = string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  tabId: string,
  config?: PopoverPersistConfig,
): PersistedSnapshotPayload<TData, TPopoverKey> {
  const { floating, pinnedStates, offsets, zIndexOrder } = state;
  const filterFn = config?.filter;
  const filtered = filterFn ? floating.filter(({ key }) => filterFn(key)) : floating;

  if (filtered.length === 0) {
    return {
      version: PERSIST_SCHEMA_VERSION,
      timestamp: Date.now(),
      tabId,
      floating: EMPTY_ARRAY,
      offsets: emptyRecord<TPopoverKey, DragOffset>(),
      pinnedStates: emptyRecord<TPopoverKey, boolean>(),
      zIndexOrder: EMPTY_ARRAY,
    };
  }

  const keys = new Set<TPopoverKey>(filtered.map(prop('key')));
  const cleanOffsets = sanitizePersistedOffsets(offsets, keys);
  const cleanPinned = buildCleanPinned(keys, pinnedStates);

  return {
    version: PERSIST_SCHEMA_VERSION,
    timestamp: Date.now(),
    tabId,
    floating: sanitizePersistedEntries(filtered),
    offsets: compactObject(cleanOffsets),
    pinnedStates: cleanPinned,
    zIndexOrder: zIndexOrder.filter((key) => keys.has(key)),
  };
}
