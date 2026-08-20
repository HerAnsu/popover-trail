import { useContext, useRef, useCallback } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { PopoverStoreContext } from './PopoverStoreContext';
import { invariant } from '../utils/invariant';

function assertStoreApi<TData, TContext, TPopoverKey extends string>(
  store: unknown,
): asserts store is StoreApi<PopoverStore<TData, TContext, TPopoverKey>> {
  invariant(
    typeof store === 'object' && store !== null && 'getState' in store,
    'usePopoverStoreApi must be used within a PopoverProvider',
  );
}

/**
 * Hook to retrieve the raw store API instance directly, without subscribing to state changes.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover string keys.
 * @returns The raw Zustand StoreApi instance matching PopoverStore.
 * @throws {Error} If called outside a `<PopoverProvider>`.
 */
export function usePopoverStoreApi<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(): StoreApi<PopoverStore<TData, TContext, TPopoverKey>> {
  const store = useContext(PopoverStoreContext);
  assertStoreApi<TData, TContext, TPopoverKey>(store);
  return store;
}

/**
 * Custom selector hook for direct access to reactive slices of the Popover Zustand store.
 * Compatible with React 18 / 19 Concurrent Mode with custom equality memoization support.
 *
 * @template TSelected - The extracted state slice type.
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param selector - Function to extract a slice of the store state.
 * @param equalityFn - Optional custom equality function to prevent redundant re-renders.
 * @returns The selected state slice.
 * @throws {Error} If called outside a `<PopoverProvider>`.
 */
export function usePopoverStore<
  TSelected,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  selector: (state: PopoverStore<TData, TContext, TPopoverKey>) => TSelected,
  equalityFn?: (a: TSelected, b: TSelected) => boolean,
): TSelected {
  const store = usePopoverStoreApi<TData, TContext, TPopoverKey>();
  const prevSelectorRef = useRef(selector);
  const cacheRef = useRef<{ hasValue: boolean; value: TSelected | undefined }>({
    hasValue: false,
    value: undefined,
  });

  if (prevSelectorRef.current !== selector) {
    prevSelectorRef.current = selector;
    cacheRef.current = { hasValue: false, value: undefined };
  }

  const getSelection = useCallback(
    (state: PopoverStore<TData, TContext, TPopoverKey>): TSelected => {
      const next = selector(state);
      if (
        equalityFn &&
        cacheRef.current.hasValue &&
        cacheRef.current.value !== undefined &&
        equalityFn(cacheRef.current.value, next)
      ) {
        return cacheRef.current.value;
      }
      cacheRef.current = { hasValue: true, value: next };
      return next;
    },
    [selector, equalityFn],
  );

  return useStore(store, getSelection);
}

/**
 * Hook to retrieve public popover store action dispatch methods with full generic autocompletion.
 *
 * @template TData - The type of resolved data payloads.
 * @template TContext - The type of global shared context.
 * @template TPopoverKey - Union of valid popover keys.
 * @returns Object containing dispatch actions.
 */
export function usePopoverActions<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(): Readonly<PopoverStore<TData, TContext, TPopoverKey>['actions']> {
  const store = usePopoverStoreApi<TData, TContext, TPopoverKey>();
  return store.getState().actions;
}
