import { useContext, useRef } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { PopoverStoreContext } from './PopoverStoreContext';
import { invariant } from '../utils/invariant';

/**
 * Hook to retrieve the raw store API instance directly, without subscribing to state changes.
 * Useful for performance-sensitive imperative writes (e.g. inside drag events or event handlers).
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 *
 * @returns The raw Zustand StoreApi instance matching PopoverStore.
 * @throws {Error} If called outside a `<PopoverProvider>`.
 */
export function usePopoverStoreApi<TData = unknown, TContext = unknown>(): StoreApi<
  PopoverStore<TData, TContext>
> {
  const store = useContext(PopoverStoreContext);
  invariant(store, 'usePopoverStoreApi must be used within a PopoverProvider');
  return store as StoreApi<PopoverStore<TData, TContext>>;
}

/**
 * Custom selector hook for direct access to reactive slices of the Popover Zustand store.
 * Pure React 18 / 19 Concurrent Mode compatible selector implementation with custom equality support.
 *
 * @template TSelected - The extracted state slice type.
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 *
 * @param selector - Function to extract a slice of the store state.
 * @param equalityFn - Optional custom equality function to prevent redundant re-renders.
 * @returns The selected state slice.
 * @throws {Error} If called outside a `<PopoverProvider>`.
 */
export function usePopoverStore<TSelected, TData = unknown, TContext = unknown>(
  selector: (state: PopoverStore<TData, TContext>) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean,
): TSelected {
  const store = usePopoverStoreApi<TData, TContext>();

  const prevRef = useRef<TSelected | undefined>(undefined);
  const selectorRef = useRef(selector);
  const equalityFnRef = useRef(equalityFn);

  selectorRef.current = selector;
  equalityFnRef.current = equalityFn;

  const memoizedSelector = (state: PopoverStore<TData, TContext>): TSelected => {
    const next = selectorRef.current(state);
    const eq = equalityFnRef.current;
    if (eq && prevRef.current !== undefined && eq(prevRef.current, next)) {
      return prevRef.current;
    }
    prevRef.current = next;
    return next;
  };

  return useStore(store, memoizedSelector);
}

/**
 * Hook to retrieve public popover store action dispatch methods.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @returns Object containing dispatch actions.
 */
export function usePopoverActions<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(): Readonly<PopoverStore<TData, TContext, TPopoverKey>['actions']> {
  const store = usePopoverStoreApi<TData, TContext>();
  return store.getState().actions as Readonly<
    PopoverStore<TData, TContext, TPopoverKey>['actions']
  >;
}
