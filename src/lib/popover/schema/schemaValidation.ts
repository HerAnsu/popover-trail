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

export function toSchemaKey<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>>(
  _schema: PopoverSchemaInstance<TSchema>,
  key: K,
): StrictPopoverKey<TSchema> {
  return createBrand<SchemaKeys<TSchema>, 'StrictPopoverKey'>(key);
}

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
