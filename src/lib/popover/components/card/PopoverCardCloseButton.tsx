import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';

/**
 * Sub-component for the Close action button of a `<PopoverCard>`.
 */
export type PopoverCardCloseButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function getPolymorphicProps<E extends ElementType>(
  as?: E,
  defaultElement: ElementType = 'button',
) {
  const Component = (as || defaultElement) as ElementType;
  const isNativeButton = Component === 'button';
  return {
    Component,
    buttonProps: isNativeButton ? { type: 'button' as const } : {},
  };
}

export function createSubComponentClickHandler(
  disabled?: boolean,
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void,
  actionFn?: () => void,
): (e: React.MouseEvent<HTMLButtonElement>) => void {
  return (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    actionFn?.();
    onClick?.(e);
  };
}

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
