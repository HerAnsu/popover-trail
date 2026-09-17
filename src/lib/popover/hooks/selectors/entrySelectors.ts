/**
 * Individual Entry & Data Selector Hooks for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/entrySelectors
 */

import * as React from 'react';
import { isEntryWithStatus, type TrailEntry, type NarrowTrailEntry } from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import {
  selectEntryByKey,
  selectOffset,
  selectIsLoading,
  selectError,
} from '../../store/selectors';
import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';

const REACT_USE: (<T>(usable: Promise<T>) => T) | undefined =
  'use' in React && typeof React.use === 'function' ? React.use : undefined;

/**
 * Retrieves a dictionary mapping all active popover keys to their current 2D drag offsets `{ x, y }`.
 *
 * Employs shallow equality to prevent re-renders when offsets have not changed.
 *
 * @returns Record of popover keys mapped to coordinate offsets.
 *
 * @example
 * ```tsx
 * function DebugOffsetPanel() {
 *   const offsets = usePopoverOffsets();
 *   return <pre>{JSON.stringify(offsets, null, 2)}</pre>;
 * }
 * ```
 */
export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets, shallowEqual);
}

/**
 * Retrieves the current 2D drag offset coordinates `{ x, y }` for a specific popover.
 *
 * Employs shallow equality so the component only re-renders when this card's coordinates change.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key whose offset to track.
 * @returns Coordinate offset `{ x, y }`.
 *
 * @example
 * ```tsx
 * function OffsetBadge({ cardKey }: { cardKey: string }) {
 *   const offset = usePopoverOffset(cardKey);
 *   return <span>Moved: {offset.x}px, {offset.y}px</span>;
 * }
 * ```
 */
export function usePopoverOffset<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectOffset(key), shallowEqual);
}

/**
 * Retrieves the full active trail entry for a specific popover key, or undefined if closed.
 *
 * @template K - Valid registered popover key.
 * @template TData - Resolved payload data type.
 * @param key - Popover key to look up.
 * @returns The active TrailEntry or undefined if not mounted.
 *
 * @example
 * ```tsx
 * function PopoverHeader({ cardKey }: { cardKey: string }) {
 *   const entry = usePopoverEntry(cardKey);
 *   if (!entry) return null;
 *   return <h3>{entry.title ?? entry.key}</h3>;
 * }
 * ```
 */
export function usePopoverEntry<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): TrailEntry<TData, K> | undefined {
  return usePopoverStore(selectEntryByKey<TData, K>(key));
}

/**
 * Retrieves the trail entry for a popover narrowed to an expected lifecycle status.
 *
 * Returns `undefined` if the popover is unmounted or its status does not match `expectedStatus`.
 *
 * @template K - Popover key type.
 * @template S - Lifecycle status ('loading' | 'error' | 'success').
 * @template TData - Resolved payload data type.
 * @param key - Popover key.
 * @param expectedStatus - Expected status (defaults to 'success').
 * @returns Narrowed trail entry with guaranteed status shape, or undefined.
 *
 * @example
 * ```tsx
 * const successEntry = usePopoverEntryStatus('user-card', 'success');
 * if (successEntry) {
 *   console.log('Loaded data:', successEntry.data);
 * }
 * ```
 */
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): NarrowTrailEntry<TData, 'success', K> | undefined;
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  S extends 'loading' | 'error' | 'success' = 'success',
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K, expectedStatus: S): NarrowTrailEntry<TData, S, K> | undefined;
export function usePopoverEntryStatus<
  K extends RegisteredKeys = RegisteredKeys,
  S extends 'loading' | 'error' | 'success' = 'success',
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K, expectedStatus: S = 'success' as S): NarrowTrailEntry<TData, S, K> | undefined {
  const entry = usePopoverEntry<K, TData>(key);
  return entry && isEntryWithStatus(entry, expectedStatus) ? entry : undefined;
}

/**
 * Retrieves the resolved payload data for a specific popover.
 *
 * Supports React 19 Suspense / `use()` unwrapping when an active data promise is present.
 *
 * @template K - Popover key type.
 * @template TData - Expected payload data type.
 * @param key - Popover key.
 * @returns Resolved payload data, null, or undefined if unmounted or unresolved.
 *
 * @example
 * ```tsx
 * function UserProfileCard({ cardKey }: { cardKey: string }) {
 *   const user = usePopoverData<UserProfile>(cardKey);
 *   if (!user) return <Spinner />;
 *   return <div>Hello, {user.name}!</div>;
 * }
 * ```
 */
export function usePopoverData<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): TData | null | undefined {
  const entry = usePopoverEntry<K, TData>(key);
  if (entry?.error) return entry.data;
  if (entry?.dataPromise && REACT_USE) {
    return REACT_USE(entry.dataPromise);
  }
  return entry?.data;
}

/**
 * Returns `true` while the data resolver for the given popover is actively pending.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to inspect.
 * @returns True if currently loading.
 *
 * @example
 * ```tsx
 * const isLoading = usePopoverIsLoading('card-details');
 * ```
 */
export const usePopoverIsLoading = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean => usePopoverStore(selectIsLoading(key));

/**
 * Retrieves the Error object if the data resolver for the popover threw an exception, or `null`.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to inspect.
 * @returns Error object or null.
 *
 * @example
 * ```tsx
 * const error = usePopoverError('card-details');
 * if (error) {
 *   return <Alert variant="error">{error.message}</Alert>;
 * }
 * ```
 */
export const usePopoverError = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): Error | null => usePopoverStore(selectError(key));
