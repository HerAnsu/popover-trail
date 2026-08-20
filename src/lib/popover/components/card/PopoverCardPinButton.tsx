import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { getPolymorphicProps } from '../../utils/componentUtils';

/**
 * Props for the `<PopoverCard.PinButton>` sub-component.
 */
export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

/**
 * Subcomponent for the pin/unpin action button of a `<PopoverCard>`.
 *
 * @remarks
 * Automatically retrieves the current card key and pinning state from `PopoverCardScopeContext` and dispatches `togglePin`.
 * Measures accurate screen coordinates using the card's scope ref without relying on static CSS selectors.
 *
 * @template E - Underlying HTML element or component type.
 * @param props - Polymorphic button props with children and click handlers.
 * @returns Accessible pin/unpin toggle button element.
 */
export function PopoverCardPinButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  disabled,
  ...restProps
}: PopoverCardPinButtonProps<E>) {
  const { Component, buttonProps } = getPolymorphicProps(as);
  const { entry, isPinned, actions, cardRef } = usePopoverCardScope();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }

      // Safe hierarchy resolution:
      // 1. Direct cardRef from scope
      // 2. Fallback to the closest dialog / popover-card element
      // 3. Fallback to anchor trigger entry.rect
      const targetEl =
        cardRef?.current ??
        e.currentTarget.closest('[role="dialog"]') ??
        e.currentTarget.closest('.popover-card');

      const rect = targetEl ? targetEl.getBoundingClientRect() : entry.rect;
      actions.togglePin(entry.key, rect ?? undefined);
      onClick?.(e);
    },
    [disabled, actions, entry.key, entry.rect, cardRef, onClick],
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
