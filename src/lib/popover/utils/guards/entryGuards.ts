/**
 * Pure Type Guards and State Discriminators for TrailEntry.
 *
 * @module utils/guards/entryGuards
 */

import type { TrailEntry, PopoverEntryDiscriminatedState } from '../../types/entry';

/**
 * Type guard verifying if a `TrailEntry` has resolved data successfully.
 * Narrows `entry.data` to `TData` (non-undefined) and `entry.error` to `null`.
 */
export function isResolvedEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> & { data: TData; isLoading: false; error: null } {
  return (
    entry !== undefined &&
    !entry.isLoading &&
    !entry.error &&
    (entry.status === 'success' || entry.data !== undefined)
  );
}

/**
 * Type guard verifying if a `TrailEntry` is actively fetching data.
 */
export function isLoadingEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> & { isLoading: true } {
  return entry?.isLoading === true;
}

/**
 * Type guard verifying if a `TrailEntry` encountered an error during data resolution.
 */
export function isErrorEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> & { error: Error } {
  return entry !== undefined && entry.error instanceof Error;
}

/**
 * Extracts a normalized discriminated state object from a `TrailEntry` for switch/case pattern matching.
 */
export function getEntryState<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined | null,
): PopoverEntryDiscriminatedState<TData> {
  if (!entry || entry.isLoading) {
    return { status: 'loading', isLoading: true, data: undefined, error: null };
  }
  if (entry.error) {
    return { status: 'error', isLoading: false, data: undefined, error: entry.error };
  }
  if (isResolvedEntry<TData, TPopoverKey>(entry)) {
    return { status: 'success', isLoading: false, data: entry.data, error: null };
  }
  return { status: 'loading', isLoading: true, data: undefined, error: null };
}

/**
 * Non-throwing boolean type guard verifying that an unknown value matches the TrailEntry interface.
 */
export function isTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is TrailEntry<TData, TPopoverKey> {
  if (typeof val !== 'object' || val === null) return false;
  return 'key' in val && typeof val.key === 'string' && val.key.length > 0;
}

/**
 * Assertion function verifying that `value` matches the `TrailEntry` interface.
 */
export function assertIsTrailEntry<TData = unknown>(
  value: unknown,
): asserts value is TrailEntry<TData> {
  if (!isTrailEntry(value)) {
    throw new TypeError(`Expected TrailEntry object, received: ${typeof value}`);
  }
}
