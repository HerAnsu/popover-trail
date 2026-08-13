import { createDisposable, type ScopeDisposable } from './disposable';

export interface PopoverThemeTokens {
  baseZIndex?: number;
  cascadeOffset?: number;
  transitionDurationMs?: number;
  backdropBlurPx?: number;
  cardShadow?: string;
  borderRadiusPx?: number;
}

const DEFAULT_THEME_TOKENS: Required<PopoverThemeTokens> = {
  baseZIndex: 1000,
  cascadeOffset: 24,
  transitionDurationMs: 200,
  backdropBlurPx: 8,
  cardShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  borderRadiusPx: 12,
};

function injectStyleProperty(element: HTMLElement, propertyName: string, value: string): void {
  element.style.setProperty(propertyName, value);
}

/**
 * Removes custom popover-trail theme tokens from a DOM container.
 */
export function removeThemeTokens(
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null,
): void {
  if (!element) return;
  element.style.removeProperty('--pt-base-z-index');
  element.style.removeProperty('--pt-cascade-offset');
  element.style.removeProperty('--pt-transition-duration');
  element.style.removeProperty('--pt-backdrop-blur');
  element.style.removeProperty('--pt-card-shadow');
  element.style.removeProperty('--pt-border-radius');
}

/**
 * Applies custom theme tokens to a DOM container (or document.documentElement) and returns a disposable handle.
 */
export function applyThemeTokens(
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null,
  tokens?: PopoverThemeTokens,
): ScopeDisposable {
  if (!element) return createDisposable(() => {});

  const merged =
    tokens && Object.keys(tokens).length > 0
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
