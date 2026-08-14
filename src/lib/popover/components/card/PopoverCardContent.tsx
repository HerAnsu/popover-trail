import type { ReactNode, ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';

/**
 * Sub-component for the main content body container of a `<PopoverCard>`.
 *
 * @remarks
 * Renders as a polymorphic container (`as="div"` by default, configurable to `as="section"`, `as="main"`, etc.).
 *
 * @template E - Underlying HTML element or component type.
 * @param props - Polymorphic container props and children.
 * @returns Content body wrapper element.
 */
export function PopoverCardContent<E extends ElementType = 'div'>({
  as,
  children,
  ...restProps
}: PopoverCardContentProps<E>) {
  const Component = as || 'div';
  return <Component {...restProps}>{children}</Component>;
}
