/**
 * Card Store Slice Subscription for popover cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardStoreSlice
 */

import { useCallback } from 'react';
import { usePopoverStore } from '../../context/usePopoverStore';
import { shallowEqual } from '../../utils/equality';
import { ZERO_OFFSET } from '../../constants';
import { last } from '../../utils/arrayUtils';
import type { PopoverStore, TrailEntry } from '../../types';

export * from './cardResolvers';


export interface CardStoreSliceData<TData = unknown, TPopoverKey extends string = string> {
  readonly offset: { readonly x: number; readonly y: number };
  readonly zIndex: number;
  readonly isTop: boolean;
  readonly enableArrowNavigation: boolean;
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly baseZIndex: number;
  readonly mountingClassName?: string;
  readonly unmountingClassName?: string;
  readonly mountedClassName?: string;
  readonly zIndexBaseMap?: Record<string, number> | null;
}

export function useCardStoreSlice<TData = unknown, TPopoverKey extends string = string>(
  entryKey: TPopoverKey,
): CardStoreSliceData<TData, TPopoverKey> {
  return usePopoverStore<CardStoreSliceData<TData, TPopoverKey>, TData, unknown, TPopoverKey>(
    useCallback(
      (
        state: PopoverStore<TData, unknown, TPopoverKey>,
      ): CardStoreSliceData<TData, TPopoverKey> => ({
        offset: state.offsets[entryKey] ?? ZERO_OFFSET,
        zIndex: state.zIndexOrder.indexOf(entryKey),

        isTop: last(state.zIndexOrder) === entryKey,
        enableArrowNavigation: state.enableArrowNavigation,
        trail: state.trail,
        floating: state.floating,
        baseZIndex: state.baseZIndex,
        mountingClassName: state.mountingClassName,
        unmountingClassName: state.unmountingClassName,
        mountedClassName: state.mountedClassName,
        zIndexBaseMap: state.zIndexBaseMap,
      }),
      [entryKey],
    ),
    shallowEqual,
  );
}
