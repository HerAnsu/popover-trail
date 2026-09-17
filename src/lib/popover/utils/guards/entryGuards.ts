/**
 * Pure Type Guards and State Discriminators for TrailEntry.
 *
 * @module utils/guards/entryGuards
 */

import type { TrailEntry, PopoverEntryDiscriminatedState } from '../../types/entry';

/**
 * Type guard verifying if a `TrailEntry` has resolved data successfully.
 * Narrows `entry.data` to `TData` (non-undefined) and `entry.error` to `null`.
 *
 * @template TData - Entry payload data type.
 * @template TPopoverKey - Popover identifier type.
 * @param entry - Candidate trail entry to inspect.
 * @returns True if entry status is 'success' or contains defined data without errors.
 *
 * @example
 * ```typescript
 * if (isResolvedEntry(entry)) {
 *   console.log(entry.data);
 * }
 * ```
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
 *
 * @template TData - Entry payload data type.
 * @template TPopoverKey - Popover identifier type.
 * @param entry - Candidate trail entry to inspect.
 * @returns True if entry has `isLoading: true`.
 *
 * @example
 * ```typescript
 * if (isLoadingEntry(entry)) {
 *   showSpinner();
 * }
 * ```
 */
export function isLoadingEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> & { isLoading: true } {
  return entry?.isLoading === true;
}

/**
 * Type guard verifying if a `TrailEntry` encountered an error during data resolution.
 *
 * @template TData - Entry payload data type.
 * @template TPopoverKey - Popover identifier type.
 * @param entry - Candidate trail entry to inspect.
 * @returns True if entry has an `Error` instance in its error field.
 *
 * @example
 * ```typescript
 * if (isErrorEntry(entry)) {
 *   showError(entry.error.message);
 * }
 * ```
 */
export function isErrorEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is TrailEntry<TData, TPopoverKey> & { error: Error } {
  return entry !== undefined && entry.error instanceof Error;
}

/**
 * Extracts a normalized discriminated state object from a `TrailEntry` for switch/case pattern matching.
 *
 * @template TData - Entry payload data type.
 * @template TPopoverKey - Popover identifier type.
 * @param entry - Candidate trail entry or null/undefined.
 * @returns Discriminated union representation of the entry's lifecycle and data state.
 *
 * @example
 * ```typescript
 * const state = getEntryState(entry);
 * switch (state.status) {
 *   case 'loading': return <Spinner />;
 *   case 'error': return <ErrorAlert error={state.error} />;
 *   case 'success': return <Content data={state.data} />;
 *   case 'idle': return null;
 * }
 * ```
 */
export function getEntryState<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined | null,
): PopoverEntryDiscriminatedState<TData> {
  if (!entry || entry.status === 'idle') {
    return { status: 'idle', isLoading: false, data: undefined, error: null };
  }
  if (entry.isLoading) {
    return { status: 'loading', isLoading: true, data: undefined, error: null };
  }
  if (entry.error) {
    return { status: 'error', isLoading: false, data: undefined, error: entry.error };
  }
  if (isResolvedEntry<TData, TPopoverKey>(entry)) {
    return { status: 'success', isLoading: false, data: entry.data, error: null };
  }
  return { status: 'idle', isLoading: false, data: undefined, error: null };
}

/**
 * Non-throwing boolean type guard verifying that an unknown value matches the TrailEntry interface.
 *
 * @template TData - Entry payload data type.
 * @template TPopoverKey - Popover identifier type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` satisfies the minimum TrailEntry shape.
 *
 * @example
 * ```typescript
 * if (isTrailEntry(item)) {
 *   console.log(item.key);
 * }
 * ```
 */
export function isTrailEntry<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is TrailEntry<TData, TPopoverKey> {
  if (typeof val !== 'object' || val === null) return false;
  return 'key' in val && typeof val.key === 'string' && val.key.length > 0;
}

/**
 * Assertion function verifying that `value` matches the `TrailEntry` interface.
 *
 * @template TData - Entry payload data type.
 * @param value - Candidate value to assert.
 * @throws {TypeError} If `value` is not a valid TrailEntry.
 *
 * @example
 * ```typescript
 * assertIsTrailEntry(entry);
 * // entry is now typed as TrailEntry<TData>
 * ```
 */
export function assertIsTrailEntry<TData = unknown>(
  value: unknown,
): asserts value is TrailEntry<TData> {
  if (!isTrailEntry(value)) {
    throw new TypeError(`Expected TrailEntry object, received: ${typeof value}`);
  }
}
