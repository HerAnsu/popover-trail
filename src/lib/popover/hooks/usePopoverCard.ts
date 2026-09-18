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
  resolveBaseZIndex,
  resolveTransitionClass,
} from './card/useCardStoreSlice';
import { useCardPositioning } from './card/useCardPositioning';
import { useCardInteractions } from './card/useCardInteractions';
import type { UsePopoverCardOptions, UsePopoverCardResult } from './card/cardTypes';

export type { UsePopoverCardOptions, UsePopoverCardResult } from './card/cardTypes';
export {
  handleCardKeyboard,
  type CardKeyboardNavOptions,
} from './card/useCardKeyboardNav';

/**
 * Hook coordinating styling, positioning, focus containment, keyboard navigation, and transitions for a popover card.
 *
 * @remarks
 * Encapsulates all lifecycle logic for an individual popover card:
 * - Computes combined DOM styles including z-index stacking and floating positioning.
 * - Manages focus trapping and initial focus on mount.
 * - Handles Escape key dismissal and arrow key navigation along the trail cascade.
 * - Manages hover open/close timers when configured.
 *
 * @example
 * ```tsx
 * function MyPopoverCard({ entry, index, isPinned }) {
 *   const { ref, style, isTop, handlePinToggle } = usePopoverCard({
 *     entry,
 *     index,
 *     isPinned,
 *   });
 *
 *   return (
 *     <div ref={ref} style={style} className={isTop ? 'active-card' : 'card'}>
 *       <h3>{entry.title}</h3>
 *       <button onClick={handlePinToggle}>Pin</button>
 *     </div>
 *   );
 * }
 * ```
 *
 * @param options - Card configuration options (entry, index, isPinned, placement).
 * @returns Object with DOM ref, styles, transition classes, and event interaction handlers.
 */
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
  const { key, transitionStatus, mountingClassName, unmountingClassName, mountedClassName } = entry;
  const slice = useCardStoreSlice<TData, TPopoverKey>(key);
  const {
    mountingClassName: sliceMounting,
    unmountingClassName: sliceUnmounting,
    mountedClassName: sliceMounted,
    zIndexBaseMap,
    baseZIndex: sliceBaseZIndex,
    offset,
    zIndex,
    enableArrowNavigation,
    trail,
    floating,
    isTop,
  } = slice;

  const actions = usePopoverActions<TData, TContext, TPopoverKey>();

  useCardMountingTransition(key, transitionStatus, actions);

  const transitionClassName = resolveTransitionClass(
    transitionStatus,
    {
      mounting: mountingClassName,
      unmounting: unmountingClassName,
      mounted: mountedClassName,
    },
    {
      mounting: sliceMounting,
      unmounting: sliceUnmounting,
      mounted: sliceMounted,
    },
  );

  const baseZIndex = resolveBaseZIndex(entry, zIndexBaseMap, sliceBaseZIndex);
  const { ref, setCombinedRef, style } = useCardPositioning({
    entry,
    index,
    isPinned,
    placement,
    offset,
    zIndex,
    baseZIndex,
  });

  useCardFocusManagement(entry, ref);

  const interactions = useCardInteractions<TData, TContext, TPopoverKey>({
    entry,
    isPinned,
    cardRef: ref,
    actions,
    enableArrowNavigation,
    trail,
    floatingCount: floating.length,
  });

  return {
    ref: setCombinedRef,
    style,
    isTop,
    isDragging: false,
    actions,
    dragHandleProps: {},
    transitionClassName,
    ...interactions,
  };
}
