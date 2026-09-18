/**
 * Theme Styling Token Type Contracts & Defaults.
 * Clean Architecture Layer 1: Core Kernel.
 *
 * @module utils/theme/themeTypes
 */

export interface PopoverThemeTokens {
  baseZIndex?: number;
  cascadeOffset?: number;
  transitionDurationMs?: number;
  backdropBlurPx?: number;
  cardShadow?: string;
  borderRadiusPx?: number;
}

export const DEFAULT_THEME_TOKENS: Required<PopoverThemeTokens> = {
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
