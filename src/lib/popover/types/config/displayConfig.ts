/**
 * Display Layout Strategies, Directions, and Immutability Contracts.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/config/displayConfig
 */

import type { Placement } from '@floating-ui/react';
import type { PopoverKey } from '../branded';

export type PopoverKeyId = PopoverKey;

export type DeepReadonly<T> = T extends (...args: never[]) => unknown
  ? T
  : T extends ReadonlyMap<infer K, infer V>
    ? ReadonlyMap<DeepReadonly<K>, DeepReadonly<V>>
    : T extends ReadonlySet<infer U>
      ? ReadonlySet<DeepReadonly<U>>
      : T extends readonly (infer U)[]
        ? readonly DeepReadonly<U>[]
        : T extends object
          ? { readonly [K in keyof T]: DeepReadonly<T[K]> }
          : T;

export const CASCADE_OFFSET_DIRECTIONS = [
  'left',
  'right',
  'top',
  'bottom',
  'none',
] as const;

export type CascadeOffsetDirection = (typeof CASCADE_OFFSET_DIRECTIONS)[number];

export const DRAG_AXES = ['x', 'y', 'both'] as const;
export type DragAxis = (typeof DRAG_AXES)[number];
export const POPOVER_RESPONSIVE_MODES = [
  'auto',
  'popover',
  'bottom-sheet',
  'modal',
] as const;

export type PopoverResponsiveMode = (typeof POPOVER_RESPONSIVE_MODES)[number];

export const POPOVER_LAYOUT_STRATEGIES = [
  'floating-ui',
  'fixed-center',
  'docked-bottom',
  'docked-top',
  'custom',
] as const;

export type PopoverLayoutStrategy = (typeof POPOVER_LAYOUT_STRATEGIES)[number];

export type PopoverPlacement = Placement | 'auto';

/**
 * Extended CSS properties dictionary including popover engine custom CSS variables.
 */
export interface PopoverCSSProperties extends React.CSSProperties {
  '--popover-z-index'?: number | string;
  '--popover-offset-x'?: number | string;
  '--popover-offset-y'?: number | string;
  '--popover-transition-duration'?: string;
  '--popover-max-height'?: string;
  '--popover-max-width'?: string;
  '--popover-translate-x'?: string;
  '--popover-translate-y'?: string;
  '--popover-rotate-x'?: string;
  '--popover-rotate-y'?: string;
  '--popover-rotate-z'?: string;
  '--pt-top'?: string;
  '--pt-left'?: string;
  '--pt-z-index'?: number | string;
  '--pt-drag-x'?: string;
  '--pt-drag-y'?: string;
  '--pt-tilt-deg'?: string;
  [key: `--${string}`]: string | number | undefined;
}
