import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { getPolymorphicProps } from '../../utils/componentUtils';

/**
 * Props for the `<PopoverCard.CloseButton>` sub-component.
 */
export type PopoverCardCloseButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

/**
 * Sub-component for the close button of a `<PopoverCard>`.
 *
 * @remarks
 * Automatically retrieves the current card key from `PopoverCardScopeContext` and dispatches `closeByKey`.
 * Supports polymorphic rendering via the `as` prop (e.g. `as="button"` or custom components).
 *
 * @template E - Underlying HTML element or component type.
 * @param props - Polymorphic button props with children and click handlers.
 * @returns Accessible close button element.
 */
export function PopoverCardCloseButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  disabled,
  ...restProps
}: PopoverCardCloseButtonProps<E>) {
  const { Component, buttonProps } = getPolymorphicProps(as);
  const { entry, actions } = usePopoverCardScope();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      actions.closeByKey(entry.key);
      onClick?.(e);
    },
    [disabled, actions, entry.key, onClick],
  );

  return (
    <Component
      {...buttonProps}
      disabled={disabled}
      onClick={handleClick}
      aria-label="Close popover"
      {...restProps}>
      {children ?? '✕'}
    </Component>
  );
}
