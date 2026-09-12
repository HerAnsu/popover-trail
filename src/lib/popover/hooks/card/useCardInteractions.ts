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

export interface UseCardInteractionsOptions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  entry: TrailEntry<TData, TPopoverKey>;
  isPinned: boolean;
  cardRef: RefObject<HTMLElement | null>;
  actions: PopoverActions<TData, TContext, TPopoverKey>;
  enableArrowNavigation: boolean;
  trail: readonly TrailEntry<TData, TPopoverKey>[];
  floatingCount: number;
}

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
