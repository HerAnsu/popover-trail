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

const DEFAULT_OFFSET = Object.freeze({ x: 0, y: 0 });

export function usePopover<
  K extends RegisteredKeys = RegisteredKeys,
  TData = ResolveRegisteredData<K, RegisteredDataMap[RegisteredKeys]>,
  TContext = unknown,
>(key: K): UsePopoverResult<TData> {
  const slice = usePopoverStore(
    useCallback(
      (state: PopoverStore<TData, TContext>) => {
        const entry =
          state.floating.find((e) => e.key === key) ?? state.trail.find((e) => e.key === key);
        return {
          entry,
          isOpen: entry !== undefined,
          isPinned: state.pinnedStates[key] ?? false,
          zIndex: state.zIndexOrder.indexOf(key),
          isTop: state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key,
          offset: state.offsets[key] ?? DEFAULT_OFFSET,
        };
      },
      [key],
    ),
    shallowEqual,
  );

  const actions = usePopoverActions<TData, TContext, K>();
  const close = useCallback(() => actions.closeByKey(key, { transition: true }), [actions, key]);
  const pin = useCallback(
    (rect?: DOMRect | PopoverRect) => actions.togglePin(key, rect),
    [actions, key],
  );
  const bringToFront = useCallback(() => actions.bringToFront(key), [actions, key]);
  const updateOffset = useCallback(
    (x: number, y: number) => actions.updateOffset(key, x, y),
    [actions, key],
  );

  useDebugValue(
    slice.isOpen
      ? `Popover "${key}" [Status: ${slice.entry?.isLoading ? 'Loading' : slice.entry?.error ? 'Error' : 'Resolved'}, Pinned: ${slice.isPinned}]`
      : `Popover "${key}" [Closed]`,
  );

  return useMemo(
    (): UsePopoverResult<TData> => ({
      entry: slice.entry,
      state: slice.entry
        ? getEntryState(slice.entry)
        : { status: 'loading', isLoading: true, data: undefined, error: null },
      isOpen: slice.isOpen,
      isPinned: slice.isPinned,
      zIndex: slice.zIndex,
      isTop: slice.isTop,
      offset: slice.offset,
      isLoading: slice.entry?.isLoading ?? false,
      data: slice.entry?.data,
      error: slice.entry?.error,
      close,
      pin,
      bringToFront,
      updateOffset,
    }),
    [slice, close, pin, bringToFront, updateOffset],
  );
}
