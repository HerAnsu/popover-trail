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


/**
 * Selected state slice consumed by an individual popover card component.
 */
export interface CardStoreSliceData<TData = unknown, TPopoverKey extends string = string> {
  /** Pixel coordinate offset for the card. */
  readonly offset: { readonly x: number; readonly y: number };
  /** Relative stack position index. */
  readonly zIndex: number;
  /** Whether this card is at the topmost position in the zIndexOrder. */
  readonly isTop: boolean;
  /** Whether keyboard arrow navigation is enabled. */
  readonly enableArrowNavigation: boolean;
  /** Complete list of trail entries. */
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  /** Active floating (unpinned) trail entries. */
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  /** Global default base z-index. */
  readonly baseZIndex: number;
  /** CSS class applied when mounting. */
  readonly mountingClassName?: string;
  /** CSS class applied when unmounting. */
  readonly unmountingClassName?: string;
  /** CSS class applied when mounted. */
  readonly mountedClassName?: string;
  /** Mapping of stack group names to base z-index values. */
  readonly zIndexBaseMap?: Record<string, number> | null;
}

/**
 * Subscribes a popover card to its specific slice of store state using shallow equality comparison.
 * Minimizes unnecessary re-renders when unrelated store entries mutate.
 *
 * @template TData - Stored data type.
 * @template TPopoverKey - Branded key type.
 * @param entryKey - Key of the card to subscribe.
 * @returns Card-specific state slice (`CardStoreSliceData`).
 *
 * @example
 * ```tsx
 * const slice = useCardStoreSlice(entry.key);
 * const { offset, zIndex, isTop } = slice;
 * ```
 */
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
