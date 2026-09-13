/**
 * Schema Merger for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaMerger
 */

import type {
  PopoverSchemaDefinition,
  PopoverSchemaNode,
  PopoverSchemaInstance,
} from './schemaTypes';
import { createPopoverSchema } from './schemaBuilder';
import { safeAssign } from '../utils/cleanObject';

/**
 * Extracts raw PopoverSchemaDefinition from a standalone definition or schema instance wrapper.
 * Unwraps `{ readonly definition: PopoverSchemaDefinition }` or returns the definition directly.
 */
export type ExtractDefinition<T> = T extends { readonly definition: infer D }
  ? D extends PopoverSchemaDefinition
    ? D
    : PopoverSchemaDefinition
  : T extends PopoverSchemaDefinition
    ? T
    : PopoverSchemaDefinition;

/**
 * Converts a union of schema types into a unified intersection type.
 * Employs contravariant function parameter inference.
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Computes the intersecting composite schema definition across a tuple of schemas.
 * Ensures the combined object satisfies PopoverSchemaDefinition.
 */
export type MergedSchemaDefinition<
  TSchemas extends readonly (
    | PopoverSchemaDefinition
    | { readonly definition: PopoverSchemaDefinition }
  )[],
> =
  UnionToIntersection<ExtractDefinition<TSchemas[number]>> extends PopoverSchemaDefinition
    ? UnionToIntersection<ExtractDefinition<TSchemas[number]>>
    : PopoverSchemaDefinition;

/**
 * Extracts valid string keys from a PopoverSchemaDefinition.
 */
export type SchemaKeyOf<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;

/**
 * Maps schema keys to their underlying resolved data payloads.
 */
export type SchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in keyof TSchema]: TSchema[K] extends PopoverSchemaNode<infer TD, infer _TP, infer _TC>
    ? TD
    : never;
};

/**
 * Merges multiple popover schemas or schema definitions into a single consolidated instance.
 * Preserves full compile-time TypeScript inference across composite routes and data keys.
 *
 * @param schemas - Array of schema definitions or instantiated schema objects to combine.
 * @returns Instantiated PopoverSchemaInstance containing merged keys, routes, and actions.
 */
export function mergePopoverSchemas<
  const TSchemas extends readonly (
    | PopoverSchemaDefinition
    | { readonly definition: PopoverSchemaDefinition }
  )[],
>(...schemas: TSchemas): PopoverSchemaInstance<MergedSchemaDefinition<TSchemas>> {
  let merged: Record<string, PopoverSchemaNode> = {};
  for (const s of schemas) {
    const def = 'definition' in s ? s.definition : s;
    if (def && typeof def === 'object') {
      merged = safeAssign(merged, def);
    }
  }
  return createPopoverSchema<MergedSchemaDefinition<TSchemas>>(
    merged as MergedSchemaDefinition<TSchemas>,
  );
}
