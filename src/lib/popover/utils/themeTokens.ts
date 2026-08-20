import { createDisposable, type ScopeDisposable } from './disposable';

/**
 * Theme styling tokens configuring popover design variables in CSS.
 */
export interface PopoverThemeTokens {
  /** Base starting z-index for the popover portal layer (defaults to 1000). */
  baseZIndex?: number;
  /** Pixel offset distance between cascading popover cards (defaults to 24px). */
  cascadeOffset?: number;
  /** Card enter/exit transition duration in milliseconds (defaults to 200ms). */
  transitionDurationMs?: number;
  /** Backdrop blur radius in pixels (defaults to 8px). */
  backdropBlurPx?: number;
  /** Box shadow string applied to popover cards. */
  cardShadow?: string;
  /** Card corner border radius in pixels (defaults to 12px). */
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

export interface StyleDeclarationLike {
  setProperty(propertyName: string, value: string): void;
  removeProperty(propertyName: string): string | void | boolean;
  getPropertyValue?(propertyName: string): string;
}

export interface ElementWithStyleLike {
  style: StyleDeclarationLike;
}

function injectStyleProperty(
  element: HTMLElement | ElementWithStyleLike,
  propertyName: string,
  value: string,
): void {
  element.style.setProperty(propertyName, value);
}

/**
 * Removes custom popover-trail theme CSS variables from a DOM container.
 *
 * @param element - Target container element (defaults to `document.documentElement`).
 */
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

/**
 * Injects custom theme tokens as CSS variables on a DOM container (or `document.documentElement`)
 * and returns a disposable cleanup handle.
 *
 * @remarks
 * Injects `--pt-base-z-index`, `--pt-cascade-offset`, `--pt-transition-duration`, `--pt-backdrop-blur`,
 * `--pt-card-shadow`, and `--pt-border-radius`.
 *
 * @example
 * ```typescript
 * {
 *   using theme = applyThemeTokens(document.body, {
 *     cascadeOffset: 32,
 *     borderRadiusPx: 16,
 *   });
 *   // Custom styles active inside this block...
 * } // Tokens cleaned up automatically!
 * ```
 *
 * @param element - Target container element (defaults to `document.documentElement`).
 * @param tokens - Theme configuration options.
 * @returns ScopeDisposable handle that resets the CSS variables when disposed.
 */
export function applyThemeTokens(
  element: HTMLElement | ElementWithStyleLike | null = typeof document !== 'undefined'
    ? document.documentElement
    : null,
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
