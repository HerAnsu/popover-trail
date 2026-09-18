/**
 * Core TrailEntry Construction Engine for popover-trail.
 *
 * @module store/reducers/entry/entryBase
 */

import type { PopoverRect, TrailEntry, OpenRootOptions, OpenNestedOptions } from '../../../types';
import { extractDisplayOptions, mergeDisplayOptions } from '../../../utils/displayOptions';
import { resolveEntryStatus, resolveInitialTransitionStatus } from './entryStatus';
import { resolveEntryGeometryMetadata } from './entryGeometry';

export { createTrailEntryNode } from './entryNode';

/**
 * Constructs a fully initialized `TrailEntry` object with merged display options, geometry, and status.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Unique popover key identifier.
 * @param parentKey - Optional parent popover key.
 * @param rect - Optional DOMRect or PopoverRect representing the trigger bounds.
 * @param options - Optional root or nested display and placement options.
 * @param existingEntry - Optional prior entry to preserve data, status, and geometry from.
 * @param data - Optional pre-resolved data payload.
 * @param error - Optional error instance if failed.
 * @param isLoading - Whether the entry is currently waiting on an async data resolver.
 * @returns Fully constructed `TrailEntry` instance.
 *
 * @example
 * ```typescript
 * const entry = createTrailEntry('card-1', 'root-card', triggerRect, { placement: 'right-start' });
 * ```
 */
export function createTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey> {
  const baseOptions = existingEntry ? extractDisplayOptions(existingEntry) : {};
  const mergedOptions = mergeDisplayOptions(baseOptions, options);
  const geometry = resolveEntryGeometryMetadata(rect, parentKey, existingEntry);

  return {
    ...mergedOptions,
    ...geometry,
    key,
    parentKey: parentKey ?? undefined,
    transitionStatus: resolveInitialTransitionStatus(existingEntry?.transitionStatus),
    status: resolveEntryStatus(data, error, isLoading, existingEntry?.status),
    isLoading: Boolean(isLoading),
    error: error ?? null,
    data: data ?? existingEntry?.data ?? null,
    dataPromise: existingEntry?.dataPromise ?? undefined,
  };
}
