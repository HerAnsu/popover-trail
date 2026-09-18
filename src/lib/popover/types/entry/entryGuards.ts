/**
 * Fast Type Narrowing Predicates for Trail Entries.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/entry/entryGuards
 */

import type {
  TrailEntry,
  SuccessTrailEntry,
  IdleTrailEntry,
  NarrowTrailEntry,
} from './entryVariants';
import { isLoadingEntry, isErrorEntry, getEntryState } from '../../utils/guards/entryGuards';

export function isEntryWithStatus<
  TData,
  S extends 'idle' | 'loading' | 'error' | 'success',
  K extends string = string,
>(entry: TrailEntry<TData, K>, status: S): entry is NarrowTrailEntry<TData, S, K> {
  return getEntryState<TData, K>(entry).status === status;
}

export function isSuccessEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is SuccessTrailEntry<TData, TPopoverKey> {
  return (
    entry !== undefined &&
    (entry.status === 'success' ||
      (entry.isLoading === false &&
        !entry.error &&
        entry.data !== undefined &&
        entry.data !== null))
  );
}

export function isIdleEntry<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey> | undefined,
): entry is IdleTrailEntry<TData, TPopoverKey> {
  return entry !== undefined && (entry.status === undefined || entry.status === 'idle');
}

export { isLoadingEntry, isErrorEntry };
