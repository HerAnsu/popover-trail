import React, { useMemo, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';

/**
 * Sub-component for the drag handle area of a `<PopoverCard>`.
 */
export type PopoverCardHandleProps<E extends ElementType = 'header'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardHandle<E extends ElementType = 'header'>({
  as,
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardHandleProps<E>) {
  const Component = as || 'header';
  const { card } = usePopoverCardScope();

  const combinedStyle = useMemo(
    () => ({
      ...(card.dragHandleProps.style as React.CSSProperties),
      ...userStyle,
    }),
    [card.dragHandleProps.style, userStyle],
  );

  return (
    <Component {...card.dragHandleProps} style={combinedStyle} className={className} {...restProps}>
      {children}
    </Component>
  );
}
