/**
 * Exhaustive Pattern Matcher for Popover Entry States.
 *
 * @module utils/matchEntryState
 */

import type {
  TrailEntry,
  LoadingTrailEntry,
  ErrorTrailEntry,
  SuccessTrailEntry,
  PopoverEntryDiscriminatedState,
} from '../types/entryTypes';

export interface EntryStateMatchers<TData, R, TPopoverKey extends string = string> {
  readonly loading: (entry: LoadingTrailEntry<TData, TPopoverKey>) => R;
  readonly error: (entry: ErrorTrailEntry<TData, TPopoverKey>) => R;
  readonly success: (entry: SuccessTrailEntry<TData, TPopoverKey>) => R;
}

export interface DiscriminatedStateMatchers<TData, R> {
  readonly loading: (
    state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'loading' }>,
  ) => R;
  readonly error: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'error' }>) => R;
  readonly success: (
    state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'success' }>,
  ) => R;
}

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
  const status =
    target.status ?? (target.isLoading ? 'loading' : target.error ? 'error' : 'success');

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
