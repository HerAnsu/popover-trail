/**
 * Type Guards for Popover Schema Engine Definitions and Nodes.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaGuards
 */

import type {
  PopoverSchemaNode,
  PopoverSchemaDefinition,
  PopoverSchemaInstance,
  SchemaKeys,
} from './schemaTypes';
import { isPlainObject } from '../utils/guards/objectGuards';
import { isArray } from '../utils/guards/arrayGuards';
import { isPopoverPlacement } from '../utils/guards/placementGuards';

/** Validates whether an unknown candidate conforms to PopoverSchemaNode. */
export function isSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown>(
  val: unknown,
): val is PopoverSchemaNode<TData, TParentData, TContext> {
  if (!isPlainObject(val)) return false;

  if (typeof val.resolver !== 'function') return false;
  if (val.children !== undefined && !isArray(val.children)) return false;
  if (val.defaultPlacement !== undefined && !isPopoverPlacement(val.defaultPlacement)) {
    return false;
  }

  return true;
}

/** Validates whether an unknown candidate conforms to PopoverSchemaDefinition dictionary. */
export function isSchemaDefinition(val: unknown): val is PopoverSchemaDefinition {
  if (!isPlainObject(val)) return false;

  for (const key of Object.keys(val)) {
    if (!isSchemaNode(val[key])) return false;
  }

  return true;
}

/** Validates whether a child key is present in the schema definition. */
export function isValidSchemaChildKey(
  definition: PopoverSchemaDefinition,
  childKey: unknown,
): childKey is string {
  return typeof childKey === 'string' && Object.hasOwn(definition, childKey);
}

/**
 * Validates whether a key belongs to a specific PopoverSchemaDefinition.
 *
 * @param definition - The schema definition dictionary.
 * @param key - Candidate key to validate.
 * @returns True if key exists as an own property in definition.
 */
export function isValidSchemaKey<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
  key: unknown,
): key is SchemaKeys<TSchema> {
  return typeof key === 'string' && Object.hasOwn(definition, key);
}

/**
 * Validates whether a node contains an active, callable resolver function.
 *
 * @param node - Candidate schema node to inspect.
 * @returns True if node is a schema node with a function resolver.
 */
export function hasSchemaResolver(node: unknown): node is PopoverSchemaNode {
  return isSchemaNode(node) && typeof node.resolver === 'function';
}

/** Validates whether an unknown candidate conforms to PopoverSchemaInstance. */
export function isPopoverSchemaInstance<
  TSchema extends PopoverSchemaDefinition = PopoverSchemaDefinition,
>(val: unknown): val is PopoverSchemaInstance<TSchema> {
  return isPlainObject(val) && 'createResolver' in val && typeof val.createResolver === 'function';
}
