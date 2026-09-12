import type { ElementType } from 'react';

/**
 * Resolves polymorphic component element type and defaults native button properties (`type="button"`).
 *
 * @remarks
 * Ensures that rendered `<button>` elements default to `type="button"` to avoid accidentally submitting parent forms.
 *
 * @template E - Target ElementType to render.
 * @param as - Optional polymorphic component override.
 * @param defaultElement - Fallback element type (defaults to `'button'`).
 * @returns Object containing the resolved Component and default button attributes.
 */
export function getPolymorphicProps<E extends ElementType>(
  as?: E,
  defaultElement: ElementType = 'button',
) {
  const Component = as ?? defaultElement;
  const isNativeButton = Component === 'button';
  return {
    Component,
    buttonProps: isNativeButton ? { type: 'button' as const } : {},
  };
}

/**
 * Resolves a container reference, function, or DOM element to a raw HTMLElement.
 */
export function resolveContainerElement(
  container?: HTMLElement | (() => HTMLElement | null) | { current: HTMLElement | null } | null,
): HTMLElement | null {
  if (!container) return null;
  if (typeof container === 'function') return container();
  if ('current' in container) return container.current;
  return container;
}
