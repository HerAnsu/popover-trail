/**
 * Helper Subroutines for Popover Store Data Resolver Slice.
 *
 * @module store/slices/resolver/helpers
 */

import type { AnchorEventLike, PopoverRect, PopoverResolver, TrailEntry } from '../../../types';
import { hasBoundingClientRect } from '../../../utils/domGuards';
import { safeCallback } from '../../../utils/safeCallback';

/**
 * Extracts DOM bounding rectangle from anchor event or options override.
 *
 * @example
 * ```ts
 * const rect = resolveTriggerBoundingRect(clickEvent, options?.triggerRect);
 * ```
 *
 * @param anchorEvent - Optional DOM synthetic or native click event.
 * @param optionsRect - Optional explicit bounding rect override.
 * @returns Bounding rect if resolved, or null.
 */
export function resolveTriggerBoundingRect(
  anchorEvent?: AnchorEventLike,
  optionsRect?: DOMRect | PopoverRect | null,
): DOMRect | PopoverRect | null {
  if (optionsRect) return optionsRect;
  if (
    anchorEvent &&
    'currentTarget' in anchorEvent &&
    hasBoundingClientRect(anchorEvent.currentTarget)
  ) {
    return anchorEvent.currentTarget.getBoundingClientRect();
  }
  return null;
}

/**
 * Fires the `onOpen` lifecycle callback for a target popover entry safely.
 *
 * @example
 * ```ts
 * notifyEntryOpen(findEntryByKey, 'profileCard');
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param findEntryByKey - Entry lookup function.
 * @param key - Popover key whose onOpen callback should be invoked.
 */
export function notifyEntryOpen<TData, TPopoverKey extends string>(
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
  key: TPopoverKey,
): void {
  const entry = findEntryByKey(key);
  if (entry?.onOpen) safeCallback(entry.onOpen, [entry], { contextName: 'onOpen' });
}

/**
 * Invokes the configured data resolver callback with cancellation signal and error guards.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @param resolver - Target resolver function.
 * @param key - Popover key to resolve.
 * @param parentData - Optional parent node data payload.
 * @param context - Shared context value.
 * @param signal - AbortSignal for request cancellation.
 * @returns Promise resolving to the retrieved data.
 *
 * @example
 * ```typescript
 * const data = await invokeResolver(resolver, 'card-1', parentData, context, signal);
 * ```
 */
export async function invokeResolver<TData, TContext>(
  resolver: PopoverResolver<TData, TContext> | undefined,
  key: string,
  parentData: TData | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): Promise<TData> {
  if (signal?.aborted) throw new Error(`[popover-trail]: Request for "${key}" was aborted`);
  if (!resolver) throw new Error(`[popover-trail]: No resolver configured for key "${key}"`);
  return resolver(key, parentData, context, signal);
}

/**
 * Cancels active controllers and timers for stale active popover keys.
 *
 * @example
 * ```ts
 * cancelStaleActiveKeys(['card-1', 'card-2'], deps);
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param activeKeys - Collection of keys to abort and cancel timers for.
 * @param deps - Dependencies providing abortControllersForKeys and transitionScheduler.
 */
export function cancelStaleActiveKeys<TPopoverKey extends string = string>(
  activeKeys: readonly TPopoverKey[],
  deps: Readonly<{
    abortControllersForKeys: (keys: Iterable<TPopoverKey>) => void;
    transitionScheduler: { cancelAllForKeys: (keys: Iterable<TPopoverKey>) => void };
  }>,
): void {
  const { abortControllersForKeys, transitionScheduler } = deps;
  abortControllersForKeys(activeKeys);
  transitionScheduler.cancelAllForKeys(activeKeys);
}
