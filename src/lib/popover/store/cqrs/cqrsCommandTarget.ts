/**
 * Target Resolution and Contract for CQRS Command Bus.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/cqrs/cqrsCommandTarget
 */

import type { PopoverActions } from '../../types';

/**
 * Permissible target types from which `PopoverActions` can be extracted.
 * Supports direct actions objects, action accessor thunks, store instances with an `.actions` property,
 * or thunks returning store instances.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 */
export type CommandBusTarget<TData, TContext, TPopoverKey extends string> =
  | PopoverActions<TData, TContext, TPopoverKey>
  | (() => PopoverActions<TData, TContext, TPopoverKey>)
  | { readonly actions: PopoverActions<TData, TContext, TPopoverKey> }
  | (() => { readonly actions: PopoverActions<TData, TContext, TPopoverKey> });

/**
 * Resolves a `CommandBusTarget` into a concrete `PopoverActions` interface.
 * Unwraps function thunks and extracts `.actions` from store objects if present.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param target - The actions source or store instance to resolve.
 * @returns Concrete `PopoverActions` instance ready for command execution.
 *
 * @example
 * ```typescript
 * const actions = resolveCommandActions(store);
 * actions.clear();
 * ```
 */
export function resolveCommandActions<TData, TContext, TPopoverKey extends string>(
  target: CommandBusTarget<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> {
  const unwrapped = typeof target === 'function' ? target() : target;
  return 'actions' in unwrapped ? unwrapped.actions : unwrapped;
}
