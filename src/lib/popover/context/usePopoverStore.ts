import { useContext, useRef, useCallback } from 'react';
import { useStore } from 'zustand';
import type { StoreApi } from 'zustand/vanilla';
import type { PopoverStore } from '../types';
import type { RegisteredKeys, RegisteredDataMap } from '../types/registerTypes';
import { PopoverStoreContext } from './PopoverStoreContext';
import { invariant } from '../utils/invariant';

/**
 * Hook to retrieve the raw store API instance directly, without subscribing to state changes.
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
 * Compatible with React 18 / 19 Concurrent Mode with custom equality memoization support.
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
  const prevSelectorRef = useRef(selector);
  const cacheRef = useRef<{ hasValue: boolean; value?: TSelected }>({ hasValue: false });

  // Invalidate cache immediately when the selector function instance changes
  if (prevSelectorRef.current !== selector) {
    prevSelectorRef.current = selector;
    cacheRef.current = { hasValue: false };
  }

  const getSelection = useCallback(
    (state: PopoverStore<TData, TContext>): TSelected => {
      const next = selector(state);
      if (
        equalityFn &&
        cacheRef.current.hasValue &&
        equalityFn(cacheRef.current.value as TSelected, next)
      ) {
        return cacheRef.current.value as TSelected;
      }
      cacheRef.current = { hasValue: true, value: next };
      return next;
    },
    [selector, equalityFn],
  );

  return useStore(store, getSelection);
}

/**
 * Hook to retrieve public popover store action dispatch methods.
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
  const store = usePopoverStoreApi<TData, TContext>();
  return store.getState().actions as Readonly<
    PopoverStore<TData, TContext, TPopoverKey>['actions']
  >;
}
