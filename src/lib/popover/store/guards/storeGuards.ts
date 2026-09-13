/**
 * Zustand Store, Schema & History State Type Guards.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/guards/storeGuards
 */

import type { StoreApi } from 'zustand';
import type {
  PopoverSchemaDefinition,
  PopoverSchemaInstance,
  StrictPopoverKey,
} from '../../schema/schemaTypes';
import type { HistorySnapshot } from '../history/historyTypes';
import type { PopoverStore } from '../../types/selectorTypes';
import { isObjectRecord } from '../../utils/guards/objectGuards';
import { isArray } from '../../utils/guards/arrayGuards';

/**
 * Validates whether an unknown value is a valid Zustand StoreApi instance.
 * Ensures getState, setState, and subscribe methods are present.
 */
export function isStoreApi<T = unknown>(val: unknown): val is StoreApi<T> {
  if (!isObjectRecord(val)) return false;
  return (
    typeof val.getState === 'function' &&
    typeof val.setState === 'function' &&
    typeof val.subscribe === 'function'
  );
}

/**
 * Validates whether an unknown value is a full PopoverStore instance.
 * Inspects the current state snapshot to confirm store actions contract presence.
 */
export function isPopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(val: unknown): val is PopoverStore<TData, TContext, TPopoverKey> {
  if (!isStoreApi(val)) return false;
  const state = val.getState();
  return isObjectRecord(state) && 'actions' in state;
}

/**
 * Validates whether an unknown object is an instantiated PopoverSchemaInstance.
 * Confirms both schema definition structure and createResolver factory presence.
 */
export function isSchemaInstance<TSchema extends PopoverSchemaDefinition = PopoverSchemaDefinition>(
  val: unknown,
): val is PopoverSchemaInstance<TSchema> {
  if (!isObjectRecord(val)) return false;
  return isObjectRecord(val.definition) && typeof val.createResolver === 'function';
}

/**
 * Runtime type guard checking whether an unknown key is a valid key defined in the schema.
 * Supports both standalone schema definitions and instantiated schema wrappers.
 */
export function isSchemaKey<TSchema extends PopoverSchemaDefinition>(
  schema: PopoverSchemaInstance<TSchema> | TSchema,
  key: unknown,
): key is StrictPopoverKey<TSchema> {
  if (typeof key !== 'string' || key.length === 0) return false;
  const def = isSchemaInstance<TSchema>(schema) ? schema.definition : schema;
  return isObjectRecord(def) && Object.hasOwn(def, key);
}

/**
 * Validates whether an unknown value conforms to a HistorySnapshot structure.
 * Verifies presence of trail, floating, zIndexOrder arrays and offset dictionaries.
 */
export function isHistorySnapshot(val: unknown): val is HistorySnapshot {
  if (!isObjectRecord(val)) return false;
  return (
    isArray(val.trail) &&
    isArray(val.floating) &&
    isArray(val.zIndexOrder) &&
    isObjectRecord(val.offsets) &&
    isObjectRecord(val.pinnedStates)
  );
}
