/**
 * Accessible Pin/Unpin Toggle Button Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Toggles the popover between the cascading trail and the persistent floating stack.
 *
 * @example
 * ```tsx
 * <PopoverCard.PinButton />
 * ```
 *
 * @module components/card/PopoverCardPinButton
 */
import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { CardActionButtonBase, type CardActionButtonBaseProps } from './CardActionButtonBase';
import { resolveActionLabel } from '../../utils/a11y';

export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardPinButton<E extends ElementType = 'button'>({
  children,
  ...restProps
}: PopoverCardPinButtonProps<E>) {
  const { entry, isPinned, actions, cardRef } = usePopoverCardScope();
  const { key, rect: entryRect } = entry;
  const { togglePin } = actions;

  const handleTogglePin = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      const targetEl =
        cardRef?.current ??
        e.currentTarget.closest('[role="dialog"]') ??
        e.currentTarget.closest('.popover-card');

      const rect = targetEl ? targetEl.getBoundingClientRect() : entryRect;
      togglePin(key, rect ?? undefined);
    },
    [togglePin, key, entryRect, cardRef],
  );

  return (
    <CardActionButtonBase<E>
      {...(restProps as CardActionButtonBaseProps<E>)}
      ariaLabel={resolveActionLabel(isPinned ? 'unpin' : 'pin')}
      onAction={handleTogglePin}
      aria-pressed={isPinned}>
      {children ?? (isPinned ? '📌' : '📍')}
    </CardActionButtonBase>
  );
}
