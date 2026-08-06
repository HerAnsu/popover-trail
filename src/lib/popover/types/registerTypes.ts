/**
 * Global Declaration Merging Module for popover-trail.
 * Enables application-wide popover schema registration and automatic key/data autocompletion.
 *
 * @module types/registerTypes
 */

import type { PopoverSchemaDefinition, SchemaKeys, InferSchemaDataMap } from '../schema';

/**
 * Global Register interface for Declaration Merging.
 * Enables application-wide schema type inference and key autocompletion.
 *
 * @example
 * ```typescript
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

/** Inferred schema type from global Register interface if merged. */
export type RegisteredSchema = Register extends { schema: infer S }
  ? S extends PopoverSchemaDefinition
    ? S
    : never
  : never;

/** Inferred popover key union from registered schema or generic string fallback. */
export type RegisteredKeys = [RegisteredSchema] extends [never]
  ? string
  : SchemaKeys<RegisteredSchema>;

/** Inferred popover data payload map from registered schema or generic record fallback. */
export type RegisteredDataMap = [RegisteredSchema] extends [never]
  ? Record<string, unknown>
  : InferSchemaDataMap<RegisteredSchema>;
