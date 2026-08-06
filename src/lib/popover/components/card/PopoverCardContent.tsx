import type { ReactNode, ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';

/**
 * Sub-component for the main content body container of a `<PopoverCard>`.
 */
export type PopoverCardContentProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardContent<E extends ElementType = 'div'>({
  as,
  children,
  ...restProps
}: PopoverCardContentProps<E>) {
  const Component = as || 'div';
  return <Component {...restProps}>{children}</Component>;
}
