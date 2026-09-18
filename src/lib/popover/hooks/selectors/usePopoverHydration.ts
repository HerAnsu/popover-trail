/**
 * Popover Hydration Lifecycle Hook for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/usePopoverHydration
 */

import { useCallback } from 'react';
import { usePopoverActions } from '../../context/usePopoverStore';
import { usePopoverEntry } from './entrySelectors';
import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../../types/registerTypes';

/**
 * Discriminated union representing the hydration lifecycle of an individual popover:
 * - `'idle'`: Not currently mounted or hydrating.
 * - `'hydrating'`: Asynchronous data resolution in-flight.
 * - `'hydrated'`: Data resolution succeeded.
 * - `'error'`: Asynchronous resolver failed.
 *
 * @template TData - Popover payload data type.
 */
export type PopoverHydrationState<TData = unknown> =
  | { status: 'idle'; isHydrating: false; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrating'; isHydrating: true; isHydrated: false; data: undefined; error: null }
  | { status: 'hydrated'; isHydrating: false; isHydrated: true; data: TData | null; error: null }
  | { status: 'error'; isHydrating: false; isHydrated: false; data: undefined; error: Error };

/**
 * Tracks the asynchronous hydration and data resolution status of a specific popover card.
 *
 * Provides reactive boolean flags (`isLoading`, `error`, `data`) and a `reload()` callback to re-trigger resolution.
 *
 * @example
 * ```tsx
 * function UserDetailsCard({ cardKey }: { cardKey: string }) {
 *   const { isLoading, error, data, reload } = usePopoverHydration(cardKey);
 *   if (isLoading) return <Spinner />;
 *   if (error) return <button onClick={reload}>Retry</button>;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 *
 * @template K - Valid registered popover key.
 * @template TData - Inferred data payload type associated with key K.
 * @param key - Popover key to observe.
 * @returns Object with `state`, `isLoading`, `error`, `data`, and `reload`.
 */
export function usePopoverHydration<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
>(key: K) {
  const actions = usePopoverActions();
  const entry = usePopoverEntry<K, TData>(key);
  const reload = useCallback(() => {
    void actions.retryPopover(key);
  }, [actions, key]);

  let state: PopoverHydrationState<TData> = {
    status: 'idle',
    isHydrating: false,
    isHydrated: false,
    data: undefined,
    error: null,
  };

  if (entry) {
    if (entry.isLoading) {
      state = {
        status: 'hydrating',
        isHydrating: true,
        isHydrated: false,
        data: undefined,
        error: null,
      };
    } else if (entry.error) {
      state = {
        status: 'error',
        isHydrating: false,
        isHydrated: false,
        data: undefined,
        error: entry.error,
      };
    } else if (!entry.isLoading && !entry.error) {
      state = {
        status: 'hydrated',
        isHydrating: false,
        isHydrated: true,
        data: entry.data ?? null,
        error: null,
      };
    }
  }

  return {
    state,
    isLoading: state.isHydrating,
    error: state.error,
    data: state.data,
    reload,
  };
}
