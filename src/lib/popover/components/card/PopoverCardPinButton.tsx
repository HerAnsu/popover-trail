import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { getPolymorphicProps } from './PopoverCardCloseButton';

/**
 * Sub-component for the Pin/Unpin action button of a `<PopoverCard>`.
 */
export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardPinButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  disabled,
  ...restProps
}: PopoverCardPinButtonProps<E>) {
  const { Component, buttonProps } = getPolymorphicProps(as);
  const { entry, isPinned, actions } = usePopoverCardScope();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      const cardEl = (e.currentTarget as HTMLElement).closest('.popover-card');
      const rect = cardEl ? cardEl.getBoundingClientRect() : entry.rect;
      actions.togglePin(entry.key, rect ?? undefined);
      onClick?.(e);
    },
    [disabled, actions, entry.key, entry.rect, onClick],
  );

  return (
    <Component
      {...buttonProps}
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={isPinned}
      aria-label={isPinned ? 'Unpin popover' : 'Pin popover'}
      data-pinned={isPinned}
      {...restProps}>
      {children ?? (isPinned ? 'Unpin' : 'Pin')}
    </Component>
  );
}
