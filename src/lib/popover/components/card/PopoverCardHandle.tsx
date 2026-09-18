/**
 * Drag Handle Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/PopoverCardHandle
 */

import { useMemo, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { Slot } from '../../utils/slot';

export type PopoverCardHandleProps<E extends ElementType = 'header'> = PolymorphicProps<
  E,
  { children?: ReactNode; asChild?: boolean }
>;

/**
 * Drag handle wrapper that binds DnD pointer listeners from the enclosing popover card scope.
 * Allows users to drag and reposition pinned/floating cards across the viewport canvas.
 *
 * @example
 * ```tsx
 * <PopoverCard.Handle as="div" className="custom-drag-handle">
 *   <span>Drag handle</span>
 * </PopoverCard.Handle>
 * ```
 */
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
  const { dragHandleProps } = card;

  const handleStyle = dragHandleProps?.style;
  const combinedStyle = useMemo(
    () => (userStyle ? { ...handleStyle, ...userStyle } : handleStyle),
    [handleStyle, userStyle],
  );

  return (
    <Component {...dragHandleProps} style={combinedStyle} className={className} {...restProps}>
      {children}
    </Component>
  );
}
