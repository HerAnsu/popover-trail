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
  StackGroupId,
  ViewportX,
  ViewportY,
  OwnerId,
  TabId,
  PopoverKey,
  ParentKey,
  ZIndexDepth,
} from './branded';

export type { DeepReadonly } from './configTypes';
