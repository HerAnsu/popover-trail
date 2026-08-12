import type { ElementType, MouseEvent } from 'react';

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

/**
 * Creates a guarded click event handler wrapper for subcomponents.
 */
export function createSubComponentClickHandler(
  disabled?: boolean,
  onClick?: (e: MouseEvent<HTMLButtonElement>) => void,
  actionFn?: () => void,
): (e: MouseEvent<HTMLButtonElement>) => void {
  return (e: MouseEvent<HTMLButtonElement>) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    actionFn?.();
    onClick?.(e);
  };
}
