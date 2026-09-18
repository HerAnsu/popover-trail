/**
 * Lifecycle Status and Transition Resolution for Popover Trail Entries.
 *
 * @module store/reducers/entry/entryStatus
 */

import type { PopoverTransitionStatus, TrailEntry } from '../../../types';
import { TRANSITION_STATUS_UNMOUNTING } from '../../../constants';

/**
 * Resolves entry status based on data, error, and loading flags.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param data - Optional resolved data payload.
 * @param error - Optional error object or null.
 * @param isLoading - Whether the entry is currently loading.
 * @param fallbackStatus - Fallback status if flags do not match.
 * @returns Resolved TrailEntry status.
 */
export function resolveEntryStatus<TData = unknown, TPopoverKey extends string = string>(
  data?: TData,
  error?: Error | null,
  isLoading = false,
  fallbackStatus: TrailEntry<TData, TPopoverKey>['status'] = 'loading',
): TrailEntry<TData, TPopoverKey>['status'] {
  if (data !== undefined && data !== null) return 'success';
  if (error) return 'error';
  if (isLoading) return 'loading';
  return fallbackStatus;
}

/**
 * Resolves initial transition status, preserving existing unless unmounting.
 *
 * @param existing - Existing transition status if present.
 * @returns Initial transition status ('mounting' or preserved existing).
 */
export function resolveInitialTransitionStatus(
  existing?: PopoverTransitionStatus,
): PopoverTransitionStatus {
  return existing && existing !== TRANSITION_STATUS_UNMOUNTING ? existing : 'mounting';
}
