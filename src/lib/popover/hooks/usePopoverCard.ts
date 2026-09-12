/**
 * Composite Hook orchestrating positioning, focus, keyboard navigation, and transitions for cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/usePopoverCard
 */

import { usePopoverActions } from '../context/usePopoverStore';
import { useCardFocusManagement } from './card/useCardFocusManagement';
import {
  useCardStoreSlice,
  useCardMountingTransition,
  resolveEffectiveBaseZIndex,
  resolveTransitionClassName,
} from './card/useCardStoreSlice';
import { useCardPositioning } from './card/useCardPositioning';
import { useCardInteractions } from './card/useCardInteractions';
import type { UsePopoverCardOptions, UsePopoverCardResult } from './card/cardTypes';

export type { UsePopoverCardOptions, UsePopoverCardResult } from './card/cardTypes';
export {
  handleCardKeyboardNavigation,
  type CardKeyboardNavigationOptions,
} from './card/useCardKeyboardNav';

export function usePopoverCard<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>({
  entry,
  index,
  isPinned,
  placement = 'bottom',
}: UsePopoverCardOptions<TData, TPopoverKey>): UsePopoverCardResult<TData, TContext, TPopoverKey> {
  const slice = useCardStoreSlice<TData, TPopoverKey>(entry.key);
  const actions = usePopoverActions<TData, TContext, TPopoverKey>();

  useCardMountingTransition(entry.key, entry.transitionStatus, actions);

  const transitionClassName = resolveTransitionClassName(
    entry.transitionStatus,
    {
      mounting: entry.mountingClassName,
      unmounting: entry.unmountingClassName,
      mounted: entry.mountedClassName,
    },
    {
      mounting: slice.mountingClassName,
      unmounting: slice.unmountingClassName,
      mounted: slice.mountedClassName,
    },
  );

  const effectiveBaseZIndex = resolveEffectiveBaseZIndex(
    entry,
    slice.zIndexBaseMap,
    slice.baseZIndex,
  );
  const { ref, setCombinedRef, style } = useCardPositioning({
    entry,
    index,
    isPinned,
    placement,
    offset: slice.offset,
    zIndex: slice.zIndex,
    effectiveBaseZIndex,
  });

  useCardFocusManagement(entry, ref);

  const interactions = useCardInteractions<TData, TContext, TPopoverKey>({
    entry,
    isPinned,
    cardRef: ref,
    actions,
    enableArrowNavigation: slice.enableArrowNavigation,
    trail: slice.trail,
    floatingCount: slice.floating.length,
  });

  return {
    ref: setCombinedRef,
    style,
    isTop: slice.isTop,
    isDragging: false,
    actions,
    dragHandleProps: {},
    transitionClassName,
    ...interactions,
  };
}
