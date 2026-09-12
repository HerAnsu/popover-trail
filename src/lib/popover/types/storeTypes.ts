/**
 * Zustand Store Interfaces, Action Signatures, and Middleware types for popover-trail.
 * Re-export facade consolidating modular types under `src/lib/popover/types/`.
 *
 * @module types/storeTypes
 */

export * from './storeStateTypes';
export * from './actionTypes';
export * from './sliceDescriptorTypes';
export * from './middlewareTypes';
export * from './selectorTypes';

export type {
  Brand,
  AnyBrand,
  Unbrand,
  BrandTagOf,
  IsBranded,
  StackGroupId,
  ViewportX,
  ViewportY,
  OwnerId,
  TabId,
  PopoverKey,
  ParentKey,
  ZIndexDepth,
  TriggerId,
  ScopeId,
  SubscriptionId,
  WorkerTaskId,
  CausalSequence,
  StorageKey,
  ChannelId,
  CacheKey,
  HistoryCapacity,
  DurationMs,
  TimestampMs,
} from './branded';

export {
  EMPTY_READONLY_ARRAY,
  EMPTY_READONLY_OBJECT,
  emptyRecord,
} from './branded';

export type { DeepReadonly } from './configTypes';
