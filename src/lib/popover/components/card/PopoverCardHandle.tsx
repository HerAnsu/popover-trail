import React, { useMemo, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';

/**
 * Sub-component for the draggable handle header area of a `<PopoverCard>`.
 *
 * @remarks
 * Attaches pointer drag listeners and styling (`cursor: grab / grabbing`, touch action) from `useDragAndDrop`.
 * Supports polymorphic rendering via the `as` prop (defaults to `'header'`).
 *
 * @template E - Underlying HTML element or component type.
 * @param props - Polymorphic handle props with children and styles.
 * @returns Draggable handle container element.
 */
export function PopoverCardHandle<E extends ElementType = 'header'>({
  as,
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardHandleProps<E>) {
  const Component = as || 'header';
  const { card } = usePopoverCardScope();

  const handleStyle = card.dragHandleProps?.style as React.CSSProperties | undefined;
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
