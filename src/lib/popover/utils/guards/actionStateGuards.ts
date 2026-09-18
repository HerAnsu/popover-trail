/**
 * React 19 Server Action State Type Guards.
 * Clean Architecture Layer 1 / Layer 3 Interface Contracts.
 *
 * @module utils/guards/actionStateGuards
 */

import { type PopoverActionState, POPOVER_ACTION_STATUSES } from '../../types/react19Types';
import { isRecordObject } from './stringGuards';

const VALID_ACTION_STATUSES: ReadonlySet<string> = new Set<string>(POPOVER_ACTION_STATUSES);

/** Validates whether an unknown value conforms to a PopoverActionState structure. */
export function isPopoverActionState<TData = unknown, TError = Error>(
  val: unknown,
): val is PopoverActionState<TData, TError> {
  if (!isRecordObject(val)) return false;
  return typeof val.status === 'string' && VALID_ACTION_STATUSES.has(val.status);
}

/** Checks if the action state is currently idle. */
export function isIdleActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>, { status: 'idle' }> {
  return state.status === 'idle';
}

/** Checks if the action state is currently pending. */
export function isPendingActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>, { status: 'pending' }> {
  return state.status === 'pending';
}

/** Checks if the action state resolved successfully. */
export function isSuccessActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>, { status: 'success' }> {
  return state.status === 'success';
}

/** Checks if the action state encountered an error. */
export function isErrorActionState<TData, TError = Error>(
  state: PopoverActionState<TData, TError>,
): state is Extract<PopoverActionState<TData, TError>, { status: 'error' }> {
  return state.status === 'error';
}
