/**
 * High-Level Ergonomic Composite Hook for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/usePopover
 */

import { useCallback, useDebugValue, useMemo } from 'react';
import {
  getEntryState,
  type PopoverRect,
  type PopoverStore,
  type UsePopoverResult,
} from '../../types';
import { usePopoverActions, usePopoverStore } from '../../context/usePopoverStore';
import type {
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';
import { ZERO_OFFSET } from '../../constants';
import { findEntryInStore } from '../../utils/collections';
import { last } from '../../utils/arrayUtils';



/**
 * High-level ergonomic composite hook for reactive inspection and control of an individual popover card.
 *
 * @remarks
 * Subscribes to popover presence, pinning, z-index stacking depth, and spatial drag offset using
 * shallow value equality (`shallowEqual`), eliminating redundant re-renders.
 * Returns a discriminated union narrowed on `isOpen`:
 * - When `isOpen: true`, `entry` is guaranteed to be non-undefined with typed data.
 * - When `isOpen: false`, `entry` is undefined with idle state and negative z-index (-1).
 *
 * @template K - Branded key type matching registered schema or raw string.
 * @template TData - Inferred data payload type associated with key K.
 * @template TContext - Ambient context type.
 * @param key - Unique popover card key.
 * @returns Discriminated result object containing state flags, entry snapshot, and action dispatchers.
 *
 * @example
 * ```tsx
 * function ProfileCard() {
 *   const { isOpen, entry, isPinned, pin, close } = usePopover('user_profile');
 *   if (!isOpen) return null;
 *
 *   return (
 *     <div>
 *       <h3>{entry.data.name}</h3>
 *       <button onClick={() => pin()}>Pin</button>
 *       <button onClick={close}>Dismiss</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function usePopover<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
  TContext = unknown,
>(key: K): UsePopoverResult<TData> {
  const slice = usePopoverStore(
    useCallback(
      (state: PopoverStore<TData, TContext>) => {
        const { floating, trail, pinnedStates, zIndexOrder, offsets } = state;
        const entry = findEntryInStore(floating, trail, key);
        return {
          entry,
          isOpen: entry !== undefined,
          isPinned: pinnedStates[key] ?? false,
          zIndex: zIndexOrder.indexOf(key),
          isTop: last(zIndexOrder) === key,
          offset: offsets[key] ?? ZERO_OFFSET,
        };
      },
      [key],
    ),
    shallowEqual,
  );

  const { closeByKey, togglePin, bringToFront: bringToFrontAction, updateOffset: updateOffsetAction } =
    usePopoverActions<TData, TContext, K>();

  const close = useCallback(() => closeByKey(key, { transition: true }), [closeByKey, key]);
  const pin = useCallback(
    (rect?: DOMRect | PopoverRect) => togglePin(key, rect),
    [togglePin, key],
  );
  const bringToFront = useCallback(() => bringToFrontAction(key), [bringToFrontAction, key]);
  const updateOffset = useCallback(
    (x: number, y: number) => updateOffsetAction(key, x, y),
    [updateOffsetAction, key],
  );

  useDebugValue(
    slice.isOpen
      ? `Popover "${key}" [Status: ${slice.entry?.isLoading ? 'Loading' : slice.entry?.error ? 'Error' : 'Resolved'}, Pinned: ${slice.isPinned}]`
      : `Popover "${key}" [Closed]`,
  );

  return useMemo((): UsePopoverResult<TData> => {
    const { isOpen, entry, isPinned, zIndex, isTop, offset } = slice;
    if (isOpen && entry) {
      const { isLoading = false, data = null, error = null } = entry;
      return {
        isOpen: true,
        entry,
        state: getEntryState(entry),
        isPinned,
        zIndex,
        isTop,
        offset,
        isLoading,
        data,
        error,
        close,
        pin,
        bringToFront,
        updateOffset,
      };
    }
    return {
      isOpen: false,
      entry: undefined,
      state: { status: 'idle', isLoading: false, data: undefined, error: null },
      isPinned: false,
      zIndex: -1,
      isTop: false,
      offset,
      isLoading: false,
      data: undefined,
      error: undefined,
      close,
      pin,
      bringToFront,
      updateOffset,
    };
  }, [slice, close, pin, bringToFront, updateOffset]);
}
