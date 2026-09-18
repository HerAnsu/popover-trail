/**
 * Action Bundle for Opening Root and Nested Popovers via Resolver Pipeline.
 *
 * @module store/slices/resolver/openActions
 */

import type { SliceContext } from '../context';
import { createResolverOpenRootAction } from './openRoot';
import { createResolverOpenNestedAction } from './openNested';

/**
 * Creates the combined root and nested open actions.
 *
 * @example
 * ```ts
 * const { openRootWithResolver, openNestedWithResolver } = createResolverOpenActions(ctx, bringToFront);
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors.
 * @param bringToFront - Callback to elevate popover z-index.
 * @returns Object exposing `openRootWithResolver` and `openNestedWithResolver`.
 */
export function createResolverOpenActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>, bringToFront: (key: TPopoverKey) => void) {
  return {
    openRootWithResolver: createResolverOpenRootAction(ctx, bringToFront),
    openNestedWithResolver: createResolverOpenNestedAction(ctx, bringToFront),
  };
}
