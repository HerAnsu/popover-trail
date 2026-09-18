/**
 * Core Theme Token Application and RAII Lifecycle.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/theme/themeCore
 */

import { createDisposable, type ScopeDisposable } from '../disposable';
import { isEmptyRecord } from '../cleanObject';
import { noop } from '../functional';
import { ensureSuffix } from '../stringUtils';
import { injectStyleProperty, removeThemeTokens } from './themeDom';
import {
  DEFAULT_THEME_TOKENS,
  type ElementWithStyleLike,
  type PopoverThemeTokens,
} from './themeTypes';

/**
 * Applies custom design tokens (z-index, cascade offset, duration, blur, shadows, border radius)
 * as CSS custom variables (`--pt-*`) to a DOM container or root document.
 *
 * Returns an idempotent disposable handle that strips the injected properties upon cleanup.
 *
 * @param element - Target DOM node or element-like object (defaults to `document.documentElement`).
 * @param tokens - Optional partial theme tokens to override defaults.
 * @returns Disposable handle removing the injected tokens on disposal.
 *
 * @example
 * ```typescript
 * const disposable = applyThemeTokens(document.body, {
 *   baseZIndex: 2000,
 *   cascadeOffset: 12,
 *   borderRadiusPx: 8,
 * });
 *
 * // Later when unmounting or switching theme:
 * disposable.dispose();
 * ```
 */
export function applyThemeTokens(
  element: HTMLElement | ElementWithStyleLike | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
  tokens?: PopoverThemeTokens,
): ScopeDisposable {

  if (!element) return createDisposable(noop);

  const merged =
    !isEmptyRecord(tokens)
      ? { ...DEFAULT_THEME_TOKENS, ...tokens }
      : DEFAULT_THEME_TOKENS;

  injectStyleProperty(element, '--pt-base-z-index', String(merged.baseZIndex));
  injectStyleProperty(element, '--pt-cascade-offset', ensureSuffix(String(merged.cascadeOffset), 'px'));
  injectStyleProperty(element, '--pt-transition-duration', ensureSuffix(String(merged.transitionDurationMs), 'ms'));
  injectStyleProperty(element, '--pt-backdrop-blur', ensureSuffix(String(merged.backdropBlurPx), 'px'));
  injectStyleProperty(element, '--pt-card-shadow', merged.cardShadow);
  injectStyleProperty(element, '--pt-border-radius', ensureSuffix(String(merged.borderRadiusPx), 'px'));

  return createDisposable(() => {
    removeThemeTokens(element);
  });
}
