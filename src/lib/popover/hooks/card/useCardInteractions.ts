/**
 * Card Event Listeners & Interaction Handlers for popover cards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/card/useCardInteractions
 */

import { useCallback, useMemo, type KeyboardEvent, type RefObject } from 'react';
import type { PopoverActions, TrailEntry } from '../../types';
import { handleCardKeyboardNavigation } from './useCardKeyboardNav';
import { resolveCardButtonControls } from './cardResolvers';

/**
 * Configuration options for attaching interactive handlers and listeners to a popover card.
 */
export interface UseCardInteractionsOptions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** The active popover card entry. */
  entry: TrailEntry<TData, TPopoverKey>;
  /** Whether the card is currently pinned to the canvas. */
  isPinned: boolean;
  /** Ref to the card root DOM element. */
  cardRef: RefObject<HTMLElement | null>;
  /** Store action dispatchers. */
  actions: PopoverActions<TData, TContext, TPopoverKey>;
  /** Whether arrow key navigation across focusable elements and cascade levels is enabled. */
  enableArrowNavigation: boolean;
  /** Complete list of trail entries. */
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  /** Count of active floating (unpinned) popovers. */
  floatingCount: number;
}

/**
 * Creates stable event handlers (mouse enter/leave, pin toggle, keyboard navigation)
 * and resolves control button states for a popover card.
 *
 * @template TData - Stored data type.
 * @template TContext - Context data type.
 * @template TPopoverKey - Branded key type.
 * @param options - Configuration options.
 * @returns Object containing `handlePinToggle`, `onMouseEnter`, `onMouseLeave`, `onKeyDown`, and `buttonControls`.
 *
 * @example
 * ```tsx
 * const { onMouseEnter, onMouseLeave, onKeyDown } = useCardInteractions({
 *   entry,
 *   isPinned,
 *   cardRef,
 *   actions,
 *   enableArrowNavigation: true,
 *   trail,
 *   floatingCount: 1,
 * });
 * ```
 */
export function useCardInteractions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>({
  entry,
  isPinned,
  cardRef,
  actions,
  enableArrowNavigation,
  trail,
  floatingCount,
}: UseCardInteractionsOptions<TData, TContext, TPopoverKey>) {
  const handlePinToggle = useCallback(() => {
    const currentRect = cardRef.current ? cardRef.current.getBoundingClientRect() : undefined;
    actions.togglePin(entry.key, currentRect);
  }, [actions, entry.key, cardRef]);

  const onMouseEnter = useCallback(() => {
    actions.hoverEnter(entry.key);
  }, [actions, entry.key]);

  const onMouseLeave = useCallback(() => {
    if (isPinned) return;
    actions.hoverLeave(entry.key);
  }, [actions, entry.key, isPinned]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>) => {
      handleCardKeyboardNavigation({
        event: e,
        cardElement: cardRef.current,
        entry,
        enableArrowNavigation,
        isPinned,
        trail,
        floatingCount,
        actions,
      });
    },
    [actions, enableArrowNavigation, entry, floatingCount, isPinned, trail, cardRef],
  );

  const buttonControls = useMemo(() => resolveCardButtonControls(entry), [entry]);

  return { handlePinToggle, onMouseEnter, onMouseLeave, onKeyDown, buttonControls };
}
