/**
 * Validation and Branded Key Helpers for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaValidation
 */

import { validateSchemaKey, validateSchemaCircularChild } from '../validators';
import { isValidSchemaChildKey } from './schemaGuards';
import { createBrand } from '../types/branded';
import type {
  PopoverSchemaDefinition,
  PopoverSchemaInstance,
  SchemaKeys,
  StrictPopoverKey,
} from './schemaTypes';
export { defineSchemaNode } from './schemaNode';

/**
 * Brands a plain string key into a compile-time validated `StrictPopoverKey<TSchema>`.
 *
 * @template TSchema - Popover schema definition.
 * @template K - Specific key union in schema.
 * @param _schema - Schema instance handle (used for phantom type guidance).
 * @param key - Raw key string matching one of the schema keys.
 * @returns Strongly branded `StrictPopoverKey`.
 *
 * @example
 * ```ts
 * const userKey = toSchemaKey(schema, 'profile');
 * ```
 */
export function toSchemaKey<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>>(
  _schema: PopoverSchemaInstance<TSchema>,
  key: K,
): StrictPopoverKey<TSchema> {
  return createBrand<SchemaKeys<TSchema>, 'StrictPopoverKey'>(key);
}

/**
 * Validates the graph integrity of a schema definition:
 * 1. Checks that no node declares itself as its own immediate child (self-loop prevention).
 * 2. Checks that every declared child key exists in the schema definition.
 *
 * @param definition - Popover schema definition to validate.
 *
 * @example
 * ```ts
 * validateSchemaIntegrity(mySchemaDefinition);
 * ```
 */
export function validateSchemaIntegrity(definition: PopoverSchemaDefinition): void {
  for (const [parentKey, node] of Object.entries(definition)) {
    if (!node?.children) continue;
    for (const childKey of node.children) {
      validateSchemaCircularChild(parentKey, childKey);
      if (!isValidSchemaChildKey(definition, childKey)) {
        validateSchemaKey(false, childKey);
      }
    }
  }
}
