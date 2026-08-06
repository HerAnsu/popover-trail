/**
 * Dynamic CSS Theme Tokens Injector for PopoverTrail.
 * Sets CSS Custom Properties directly on DOM elements without React re-renders.
 */

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

/**
 * Applies custom theme tokens to a DOM container (or document.documentElement).
 */
export function applyThemeTokens(
  element: HTMLElement | null = typeof document !== 'undefined' ? document.documentElement : null,
  tokens: PopoverThemeTokens = {},
): void {
  if (!element) return;

  const merged = { ...DEFAULT_THEME_TOKENS, ...tokens };

  element.style.setProperty('--pt-base-z-index', String(merged.baseZIndex));
  element.style.setProperty('--pt-cascade-offset', `${merged.cascadeOffset}px`);
  element.style.setProperty('--pt-transition-duration', `${merged.transitionDurationMs}ms`);
  element.style.setProperty('--pt-backdrop-blur', `${merged.backdropBlurPx}px`);
  element.style.setProperty('--pt-card-shadow', merged.cardShadow);
  element.style.setProperty('--pt-border-radius', `${merged.borderRadiusPx}px`);
}
