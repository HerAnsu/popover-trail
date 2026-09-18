/**
 * Schema Node Factory and Metadata Utilities.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaNode
 */

import type { PopoverSchemaNode } from './schemaTypes';

/**
 * Identity factory enforcing typed schema node configuration with metadata.
 *
 * @example
 * ```ts
 * const userNode = defineSchemaNode({
 *   children: ['profile', 'settings'],
 *   resolver: async (key, parentData) => fetchUser(key),
 * });
 * ```
 *
 * @param node - Popover schema node configuration.
 * @returns Strongly typed schema node.
 */
export function defineSchemaNode<TData, TParentData = unknown, TContext = unknown>(
  node: PopoverSchemaNode<TData, TParentData, TContext>,
): PopoverSchemaNode<TData, TParentData, TContext> {
  return node;
}

/**
 * Extracts declared allowed child keys from a schema node.
 *
 * @param node - Popover schema node.
 * @returns Readonly array of child key identifiers.
 *
 * @example
 * ```ts
 * const children = getAllowedChildren(userNode); // ['profile', 'settings']
 * ```
 */
export function getAllowedChildren<TData, TParent, TContext>(
  node: PopoverSchemaNode<TData, TParent, TContext>,
): readonly string[] {
  const { children } = node;
  return children ? [...children] : [];
}

/**
 * Checks if a schema node contains a specific child key.
 *
 * @param node - Popover schema node.
 * @param childKey - Child key to check.
 * @returns `true` if childKey is present in node children; `false` otherwise.
 *
 * @example
 * ```ts
 * if (hasAllowedChild(userNode, 'profile')) { ... }
 * ```
 */
export function hasAllowedChild<TData, TParent, TContext>(
  node: PopoverSchemaNode<TData, TParent, TContext>,
  childKey: string,
): boolean {
  const { children } = node;
  return children ? children.includes(childKey) : false;
}
