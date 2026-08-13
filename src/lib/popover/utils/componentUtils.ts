import type { ElementType } from 'react';

/**
 * Resolves element type and default native button props (`type="button"`).
 */
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
