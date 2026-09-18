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

/**
 * Validates whether an unknown value conforms to PopoverSchemaNode.
 *
 * @template TData - Resolved data type.
 * @template TParentData - Parent popover data type.
 * @template TContext - Ambient context type.
 * @param val - Unknown candidate value to test.
 * @returns True if `val` is a valid PopoverSchemaNode.
 *
 * @example
 * ```typescript
 * if (isSchemaNode(item)) {
 *   console.log('Valid schema node with resolver');
 * }
 * ```
 */
export function isSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown>(
  val: unknown,
): val is PopoverSchemaNode<TData, TParentData, TContext> {
  if (!isPlainObject(val)) return false;
  const { resolver, children, defaultPlacement, placement } = val as Record<string, unknown>;

  if (typeof resolver !== 'function') return false;
  if (children !== undefined && !isArray(children)) return false;
  const testPlacement = placement ?? defaultPlacement;
  if (testPlacement !== undefined && !isPopoverPlacement(testPlacement)) {
    return false;
  }

  return true;
}

/**
 * Validates whether an unknown value conforms to a PopoverSchemaDefinition dictionary.
 *
 * @param val - Unknown candidate value to test.
 * @returns True if `val` is a record mapping keys to valid schema nodes.
 *
 * @example
 * ```typescript
 * if (isSchemaDefinition(obj)) {
 *   console.log('Valid schema dictionary');
 * }
 * ```
 */
export function isSchemaDefinition(val: unknown): val is PopoverSchemaDefinition {
  if (!isPlainObject(val)) return false;

  for (const key of Object.keys(val)) {
    if (!isSchemaNode(val[key])) return false;
  }

  return true;
}

/**
 * Validates whether a child key is present as an own property in the schema definition.
 *
 * @param definition - Popover schema definition dictionary.
 * @param childKey - Candidate child key string.
 * @returns True if childKey is a valid string key in definition.
 *
 * @example
 * ```typescript
 * if (isValidSchemaChildKey(schemaDef, 'profile')) {
 *   // 'profile' exists in schema
 * }
 * ```
 */
export function isValidSchemaChildKey(
  definition: PopoverSchemaDefinition,
  childKey: unknown,
): childKey is string {
  return typeof childKey === 'string' && Object.hasOwn(definition, childKey);
}

/**
 * Validates whether a key belongs to a specific PopoverSchemaDefinition.
 *
 * @template TSchema - Schema definition type.
 * @param definition - The schema definition dictionary.
 * @param key - Candidate key to validate.
 * @returns True if key exists as an own property in definition.
 *
 * @example
 * ```typescript
 * if (isValidSchemaKey(schemaDef, 'user')) {
 *   const node = schemaDef[key];
 * }
 * ```
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
 *
 * @example
 * ```typescript
 * if (hasSchemaResolver(node)) {
 *   const data = await node.resolver(key, parentData, ctx, signal);
 * }
 * ```
 */
export function hasSchemaResolver(node: unknown): node is PopoverSchemaNode {
  return isSchemaNode(node) && typeof node.resolver === 'function';
}

/**
 * Validates whether an unknown candidate conforms to PopoverSchemaInstance.
 *
 * @template TSchema - Schema definition type.
 * @param val - Candidate value to inspect.
 * @returns True if `val` is an instantiated schema object.
 *
 * @example
 * ```typescript
 * if (isPopoverSchemaInstance(schema)) {
 *   const resolver = schema.createResolver();
 * }
 * ```
 */
export function isPopoverSchemaInstance<
  TSchema extends PopoverSchemaDefinition = PopoverSchemaDefinition,
>(val: unknown): val is PopoverSchemaInstance<TSchema> {
  return isPlainObject(val) && 'createResolver' in val && typeof val.createResolver === 'function';
}
