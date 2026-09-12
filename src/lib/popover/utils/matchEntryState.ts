/**
 * Exhaustive Pattern Matcher for Popover Entry States.
 *
 * @module utils/matchEntryState
 */

import type {
  TrailEntry,
  IdleTrailEntry,
  LoadingTrailEntry,
  ErrorTrailEntry,
  SuccessTrailEntry,
  PopoverEntryDiscriminatedState,
} from '../types/entryTypes';

export interface EntryStateMatchers<TData, R, TPopoverKey extends string = string> {
  readonly idle?: (entry: IdleTrailEntry<TData, TPopoverKey>) => R;
  readonly loading: (entry: LoadingTrailEntry<TData, TPopoverKey>) => R;
  readonly error: (entry: ErrorTrailEntry<TData, TPopoverKey>) => R;
  readonly success: (entry: SuccessTrailEntry<TData, TPopoverKey>) => R;
}

export interface DiscriminatedStateMatchers<TData, R> {
  readonly idle?: (
    state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'idle' }>,
  ) => R;
  readonly loading: (
    state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'loading' }>,
  ) => R;
  readonly error: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'error' }>) => R;
  readonly success: (
    state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'success' }>,
  ) => R;
}

/**
 * Exhaustive pattern matcher for popover entry states.
 * Executes the corresponding branch callback based on the resolved status.
 *
 * @remarks
 * Supports both full `TrailEntry` instances and lightweight `PopoverEntryDiscriminatedState` tuples.
 * When `idle` handler is omitted from `matchers`, automatically falls back to `loading`
 * to maintain seamless 3-state compatibility with existing UI spinners.
 *
 * @template TData - Data model associated with the popover.
 * @template R - Return type produced by branch handlers.
 * @template TPopoverKey - Branded key identifier type.
 * @param target - The trail entry or discriminated state snapshot.
 * @param matchers - Callback map for each possible lifecycle status.
 * @returns The computed result of the matching handler.
 *
 * @example
 * ```typescript
 * const ui = matchEntryState(entry, {
 *   idle: () => <Skeleton />,
 *   loading: () => <Spinner />,
 *   error: (err) => <ErrorMessage error={err} />,
 *   success: (item) => <CardContent data={item.data} />,
 * });
 * ```
 */
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey>,
  matchers: EntryStateMatchers<TData, R, TPopoverKey>,
): R;
export function matchEntryState<TData, R>(
  target: PopoverEntryDiscriminatedState<TData>,
  matchers: DiscriminatedStateMatchers<TData, R>,
): R;
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey> | PopoverEntryDiscriminatedState<TData>,
  matchers: EntryStateMatchers<TData, R, TPopoverKey> | DiscriminatedStateMatchers<TData, R>,
): R {
  // Gracefully derive canonical status for legacy or partially hydrated entries lacking explicit status.
  const status =
    target.status ?? (target.isLoading ? 'loading' : target.error ? 'error' : 'success');

  if (status === 'idle') {
    // If consumer did not supply a distinct 'idle' handler, fall back to 'loading'
    // ensuring 3-state consumer code does not crash on idle entries.
    if ('idle' in matchers && typeof matchers.idle === 'function') {
      return Reflect.apply(matchers.idle, matchers, [target]);
    }
    return Reflect.apply(matchers.loading, matchers, [target]);
  }
  if (status === 'loading') {
    return Reflect.apply(matchers.loading, matchers, [target]);
  }
  if (status === 'error') {
    return Reflect.apply(matchers.error, matchers, [target]);
  }
  if (status === 'success') {
    return Reflect.apply(matchers.success, matchers, [target]);
  }

  throw new Error(`Unhandled popover entry state: ${JSON.stringify(target)}`);
}
