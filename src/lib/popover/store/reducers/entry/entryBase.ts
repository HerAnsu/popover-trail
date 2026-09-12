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
 * Constructs a fully initialized TrailEntry object with default properties and geometry.
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
