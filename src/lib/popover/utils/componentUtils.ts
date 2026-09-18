import type { ElementType } from 'react';

/**
 * Resolves a polymorphic component element type and default native button properties (`type="button"`).
 *
 * Ensures that rendered `<button>` elements default to `type="button"` to avoid accidentally submitting parent forms.
 *
 * @template E - Target ElementType to render.
 * @param as - Optional polymorphic component override.
 * @param defaultElement - Fallback element type (defaults to `'button'`).
 * @returns Object containing the resolved `Component` and default `buttonProps`.
 *
 * @example
 * ```tsx
 * function CustomAction({ as, ...props }) {
 *   const { Component, buttonProps } = resolvePolymorphicProps(as);
 *   return <Component {...buttonProps} {...props} />;
 * }
 * ```
 */
export function resolvePolymorphicProps<E extends ElementType>(
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
 * Resolves a container reference, accessor function, or direct DOM element to a raw HTMLElement.
 *
 * Handles React refs `{ current: HTMLElement }`, lazy getter functions `() => HTMLElement`, or direct HTMLElement.
 *
 * @param container - Target container candidate (RefObject, getter function, direct node, or undefined).
 * @returns Resolved HTMLElement or null if unavailable.
 *
 * @example
 * ```tsx
 * const portalTarget = resolveContainerElement(customRef);
 * const bodyTarget = resolveContainerElement(() => document.getElementById('modal-root'));
 * ```
 */
export function resolveContainerElement(
  container?: HTMLElement | (() => HTMLElement | null) | { current: HTMLElement | null } | null,
): HTMLElement | null {
  if (!container) return null;
  if (typeof container === 'function') return container();
  if ('current' in container) return container.current;
  return container;
}
