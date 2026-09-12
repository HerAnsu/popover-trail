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
 */
export function notifyEntryOpen<TData, TPopoverKey extends string>(
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
  key: TPopoverKey,
): void {
  const entry = findEntryByKey(key);
  if (entry?.onOpen) safeCallback(entry.onOpen, [entry], { contextName: 'onOpen' });
}

/**
 * Invokes the configured data resolver safely with error guards.
 */
export async function invokeResolverSafely<TData, TContext>(
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
