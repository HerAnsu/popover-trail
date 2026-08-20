/**
 * Global Declaration Merging Module for popover-trail.
 * Enables application-wide popover schema registration and automatic key/data autocompletion.
 *
 * @module types/registerTypes
 */

import type { PopoverSchemaDefinition, SchemaKeys, InferSchemaDataMap } from '../schema';

/**
 * Global `Register` interface for TypeScript declaration merging.
 * Augment this interface in your application to enable project-wide autocomplete
 * for popover keys, child hierarchy validation, and resolved payload data types.
 *
 * @example
 * ```typescript
 * import { myAppSchema } from './popoverSchema';
 *
 * declare module 'popover-trail' {
 *   interface Register {
 *     schema: typeof myAppSchema;
 *   }
 * }
 * ```
 */
export interface Register {
  // schema: typeof myAppSchema;
}

/**
 * Extracts the registered schema definition type from the global `Register` interface.
 * Evaluates to `never` if no schema is registered.
 */
export type RegisteredSchema = Register extends { schema: infer S }
  ? S extends PopoverSchemaDefinition
    ? S
    : never
  : never;

/**
 * Union of all valid popover keys inferred from the registered schema.
 * Falls back to `string` if no schema is registered globally.
 *
 * @example
 * ```typescript
 * type Key = RegisteredKeys; // 'userProfile' | 'workspaceSettings' | ...
 * ```
 */
export type RegisteredKeys = [RegisteredSchema] extends [never]
  ? string
  : SchemaKeys<RegisteredSchema>;

/**
 * Dictionary mapping each registered popover key to its corresponding resolved data payload type.
 * Falls back to `Record<string, unknown>` if no schema is registered globally.
 */
export type RegisteredDataMap = [RegisteredSchema] extends [never]
  ? Record<string, unknown>
  : InferSchemaDataMap<RegisteredSchema>;

/**
 * Resolves the strongly typed data payload for a specific popover key `K`
 * from the registered schema map, falling back to `TFallback` if unregistered.
 *
 * @template K - Target popover key string.
 * @template TFallback - Fallback type if key is not found (defaults to `unknown`).
 *
 * @example
 * ```typescript
 * type User = ResolveRegisteredData<'userProfile'>; // UserData
 * ```
 */
export type ResolveRegisteredData<
  K extends string,
  TFallback = unknown,
> = K extends keyof RegisteredDataMap ? RegisteredDataMap[K] : TFallback;
