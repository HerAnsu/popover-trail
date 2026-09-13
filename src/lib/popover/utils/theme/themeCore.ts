/**
 * Core Theme Token Application and RAII Lifecycle.
 * Clean Architecture Layer 2: Headless State Management.
 *
 * @module utils/theme/themeCore
 */

import { createDisposable, type ScopeDisposable } from '../disposable';
import { isEmptyRecord } from '../cleanObject';
import { noop } from '../functional';
import { injectStyleProperty, removeThemeTokens } from './themeDom';
import {
  DEFAULT_THEME_TOKENS,
  type ElementWithStyleLike,
  type PopoverThemeTokens,
} from './themeTypes';

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
  injectStyleProperty(element, '--pt-cascade-offset', `${merged.cascadeOffset}px`);
  injectStyleProperty(element, '--pt-transition-duration', `${merged.transitionDurationMs}ms`);
  injectStyleProperty(element, '--pt-backdrop-blur', `${merged.backdropBlurPx}px`);
  injectStyleProperty(element, '--pt-card-shadow', merged.cardShadow);
  injectStyleProperty(element, '--pt-border-radius', `${merged.borderRadiusPx}px`);

  return createDisposable(() => {
    removeThemeTokens(element);
  });
}
