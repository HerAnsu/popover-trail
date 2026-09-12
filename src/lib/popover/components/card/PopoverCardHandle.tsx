import { useMemo, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { Slot } from '../../utils/slot';

export type PopoverCardHandleProps<E extends ElementType = 'header'> = PolymorphicProps<
  E,
  { children?: ReactNode; asChild?: boolean }
>;

export function PopoverCardHandle<E extends ElementType = 'header'>({
  as,
  asChild,
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardHandleProps<E>) {
  const Component = asChild ? Slot : as || 'header';
  const { card } = usePopoverCardScope();

  const handleStyle = card.dragHandleProps?.style;
  const combinedStyle = useMemo(
    () => (userStyle ? { ...handleStyle, ...userStyle } : handleStyle),
    [handleStyle, userStyle],
  );

  return (
    <Component {...card.dragHandleProps} style={combinedStyle} className={className} {...restProps}>
      {children}
    </Component>
  );
}
