/**
 * Accessible Pin/Unpin Toggle Button Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/PopoverCardPinButton
 */
import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { CardActionButtonBase, type CardActionButtonBaseProps } from './CardActionButtonBase';

export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardPinButton<E extends ElementType = 'button'>(
  props: PopoverCardPinButtonProps<E>,
) {
  const { entry, isPinned, actions, cardRef } = usePopoverCardScope();

  const handleTogglePin = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const targetEl =
        cardRef?.current ??
        e.currentTarget.closest('[role="dialog"]') ??
        e.currentTarget.closest('.popover-card');

      const rect = targetEl ? targetEl.getBoundingClientRect() : entry.rect;
      actions.togglePin(entry.key, rect ?? undefined);
    },
    [actions, entry.key, entry.rect, cardRef],
  );

  return (
    <CardActionButtonBase<E>
      {...(props as CardActionButtonBaseProps<E>)}
      ariaLabel={isPinned ? 'Unpin popover' : 'Pin popover'}
      onAction={handleTogglePin}
      aria-pressed={isPinned}>
      {props.children ?? (isPinned ? '📌' : '📍')}
    </CardActionButtonBase>
  );
}
