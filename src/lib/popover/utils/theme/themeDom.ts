/**
 * DOM Manipulation Helpers for Theme CSS Variables.
 * Clean Architecture Layer 2/3: Viewport & Integration Bridge.
 *
 * @module utils/theme/themeDom
 */

import type { ElementWithStyleLike } from './themeTypes';

export function injectStyleProperty(
  element: HTMLElement | ElementWithStyleLike,
  propertyName: string,
  value: string,
): void {
  element.style.setProperty(propertyName, value);
}

export function removeThemeTokens(
  element: HTMLElement | ElementWithStyleLike | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
): void {
  if (!element) return;
  element.style.removeProperty('--pt-base-z-index');
  element.style.removeProperty('--pt-cascade-offset');
  element.style.removeProperty('--pt-transition-duration');
  element.style.removeProperty('--pt-backdrop-blur');
  element.style.removeProperty('--pt-card-shadow');
  element.style.removeProperty('--pt-border-radius');
}
