/**
 * Shared Polymorphic Action Button Base Component for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/CardActionButtonBase
 */

import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { getPolymorphicProps } from '../../utils/componentUtils';

export type CardActionButtonBaseProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  {
    children?: ReactNode;
    ariaLabel?: string;
    onAction: (e: React.MouseEvent<HTMLButtonElement>) => void;
  }
>;

export function CardActionButtonBase<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  onAction,
  ariaLabel,
  disabled,
  ...restProps
}: CardActionButtonBaseProps<E>) {
  const { Component, buttonProps } = getPolymorphicProps(as);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      onAction(e);
      onClick?.(e);
    },
    [disabled, onAction, onClick],
  );

  return (
    <Component
      {...buttonProps}
      disabled={disabled}
      onClick={handleClick}
      aria-label={ariaLabel}
      {...restProps}>
      {children}
    </Component>
  );
}
