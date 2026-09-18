/**
 * Initial and Resolved Lifecycle Entry Creators for popover-trail.
 *
 * @module store/reducers/entry/entryLifecycle
 */

import type { OpenNestedOptions, OpenRootOptions, TrailEntry } from '../../../types';
import { extractDisplayOptions } from '../../../utils/displayOptions';
import { resolveEntryStatus } from './entryStatus';

/**
 * Constructs an initial `TrailEntry` node for newly registered triggers before data resolution begins.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Popover key identifier.
 * @param options - Optional root/nested open options and trigger rect.
 * @param _ownerId - Optional trail owner identifier.
 * @param parentKey - Optional parent popover key.
 * @returns Initialized `TrailEntry` instance.
 *
 * @example
 * ```typescript
 * const entry = createInitialTrailEntry('card-1', { rect: triggerRect }, 'user-session');
 * ```
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
 * Transitions an existing `TrailEntry` to a resolved payload or error state.
 * Preserves object identity if no properties changed.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param baseEntry - Original baseline entry.
 * @param data - Resolved data payload.
 * @param error - Optional error instance if failed.
 * @param isLoading - Whether the entry is still loading.
 * @returns Updated `TrailEntry` (or unchanged `baseEntry` reference).
 *
 * @example
 * ```typescript
 * const updated = createResolvedTrailEntry(entry, { title: 'Loaded' });
 * ```
 */
export function createResolvedTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  baseEntry: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
  error?: Error | null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey> {
  const {
    error: baseError,
    data: baseData,
    status: baseStatus,
    isLoading: baseLoading,
    dataPromise,
  } = baseEntry;
  const finalError = error !== undefined ? error : baseError;
  const finalData = data ?? baseData;
  const nextStatus = resolveEntryStatus(finalData, finalError, isLoading, baseStatus);

  if (
    finalData === baseData &&
    finalError === baseError &&
    isLoading === baseLoading &&
    nextStatus === baseStatus &&
    dataPromise === undefined
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
