/**
 * Initial and Resolved Lifecycle Entry Creators for popover-trail.
 *
 * @module store/reducers/entry/entryLifecycle
 */

import type { OpenNestedOptions, OpenRootOptions, TrailEntry } from '../../../types';
import { extractDisplayOptions } from '../../../utils/displayOptions';
import { resolveEntryStatus } from './entryStatus';

/**
 * Constructs an initial TrailEntry node for newly registered triggers.
 */
export function createInitialTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  options?: Partial<OpenRootOptions & OpenNestedOptions> & { isLoading?: boolean; rect?: DOMRect },
  _ownerId?: string | null,
  parentKey?: TPopoverKey,
): TrailEntry<TData, TPopoverKey> {
  const displayOptions = extractDisplayOptions(options);
  const entry: TrailEntry<TData, TPopoverKey> = {
    key,
    parentKey,
    isLoading: options?.isLoading ?? false,
    error: null,
    transitionStatus: 'mounted',
    ...displayOptions,
  };
  if (options?.rect !== undefined) entry.rect = options.rect;
  return entry;
}

/**
 * Transitions an existing TrailEntry to resolved payload or error state.
 */
export function createResolvedTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  baseEntry: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
  error?: Error | null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey> {
  const finalError = error !== undefined ? error : baseEntry.error;
  const finalData = data ?? baseEntry.data;
  const nextStatus = resolveEntryStatus(finalData, finalError, isLoading, baseEntry.status);

  if (
    finalData === baseEntry.data &&
    finalError === baseEntry.error &&
    isLoading === baseEntry.isLoading &&
    nextStatus === baseEntry.status &&
    baseEntry.dataPromise === undefined
  ) {
    return baseEntry;
  }

  return {
    ...baseEntry,
    data: finalData,
    error: finalError,
    status: nextStatus,
    isLoading,
    dataPromise: undefined,
  };
}
