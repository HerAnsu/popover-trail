/**
 * Strict Store Accessor Types for popover-trail.
 * Single source of truth proxying core store types from types/storeTypes.
 *
 * @module storeTypes
 */

import type { PopoverStore, PopoverStateData } from '../types/storeTypes';

export type {
  StoreSetFn,
  StoreGetFn,
  StatePatch,
  StoreState,
  StoreSliceCreator,
} from '../types/storeTypes';

/**
 * Erased internal store state payload type.
 * Ensures V8 JIT monomorphism by operating on uniform `unknown` payload slots internally.
 */
export type InternalPopoverState = PopoverStateData;

/**
 * Erased internal store instance type used across store engine internals.
 */
export type InternalPopoverStore = PopoverStore;
