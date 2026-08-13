/**
 * Core Type Definitions, Interfaces, and Type Guards for popover-trail.
 * Re-export facade consolidating modular types under `src/lib/popover/types/`.
 *
 * @module types
 */

export * from './types/configTypes';
export * from './types/entryTypes';
export * from './types/eventTypes';
export * from './types/storeTypes';
export * from './utils/typeGuards';
export * from './types/registerTypes';
export * from './types/polymorphicTypes';
export type { ParentKey, ZIndexDepth } from './types/branded';
export { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT } from './types/branded';
