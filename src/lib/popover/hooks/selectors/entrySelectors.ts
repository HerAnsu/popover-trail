/**
 * Individual Entry & Data Selector Hooks for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/entrySelectors
 */

import * as React from 'react';
import {
  isEntryWithStatus,
  type TrailEntry,
  type NarrowTrailEntry,
} from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import { selectEntryByKey, selectOffset, selectIsLoading, selectError } from '../../store/selectors';
import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';

const REACT_USE: (<T>(usable: Promise<T>) => T) | undefined =
  'use' in React && typeof React.use === 'function' ? React.use : undefined;

export function usePopoverOffsets() {
  return usePopoverStore((state) => state.offsets, shallowEqual);
}

export function usePopoverOffset<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectOffset(key), shallowEqual);
}

export function usePopoverEntry<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K): TrailEntry<TData, K> | undefined {
  return usePopoverStore(selectEntryByKey<TData, K>(key));
}

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

export const usePopoverIsLoading = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean => usePopoverStore(selectIsLoading(key));
export const useIsPopoverLoading = usePopoverIsLoading;

export const usePopoverError = <TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): Error | null => usePopoverStore(selectError(key));
export const useIsPopoverError = usePopoverError;

