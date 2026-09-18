/**
 * Placement, Alignment & Layout Mode Type Guards.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/guards/placementGuards
 */

import {
  type PopoverPlacement,
  type PopoverResponsiveMode,
  type PopoverLayoutStrategy,
  POPOVER_RESPONSIVE_MODES,
  POPOVER_LAYOUT_STRATEGIES,
} from '../../types/config/displayConfig';
import { VALID_PLACEMENTS_SET } from '../../constants';

const SIDES = new Set(['top', 'right', 'bottom', 'left']);
const ALIGNMENTS = new Set(['start', 'end']);
const AUTO_PLACEMENTS = new Set(['auto', 'auto-start', 'auto-end']);
const RESPONSIVE_MODES: ReadonlySet<string> = new Set<string>([
  ...POPOVER_RESPONSIVE_MODES,
  'none',
]);
const LAYOUT_STRATEGIES: ReadonlySet<string> = new Set<string>([
  ...POPOVER_LAYOUT_STRATEGIES,
  'floating',
]);

/** Validates whether a value is a recognized Floating UI placement. */
export function isPopoverPlacement(val: unknown): val is PopoverPlacement {
  return typeof val === 'string' && VALID_PLACEMENTS_SET.has(val);
}

/** Validates whether a value is a cardinal side. */
export function isSide(val: unknown): val is 'top' | 'right' | 'bottom' | 'left' {
  return typeof val === 'string' && SIDES.has(val);
}

/** Validates whether a value is an alignment suffix. */
export function isAlignment(val: unknown): val is 'start' | 'end' {
  return typeof val === 'string' && ALIGNMENTS.has(val);
}

/** Validates whether a value is an automatic placement strategy. */
export function isAutoPlacement(val: unknown): val is 'auto' | 'auto-start' | 'auto-end' {
  return typeof val === 'string' && AUTO_PLACEMENTS.has(val);
}

/** Checks whether a placement is vertically oriented (top or bottom). */
export function isVerticalPlacement(placement: PopoverPlacement): boolean {
  return placement.startsWith('top') || placement.startsWith('bottom');
}

/** Checks whether a placement is horizontally oriented (left or right). */
export function isHorizontalPlacement(placement: PopoverPlacement): boolean {
  return placement.startsWith('left') || placement.startsWith('right');
}

/** Validates whether a value is a valid responsive presentation mode. */
export function isResponsiveMode(val: unknown): val is PopoverResponsiveMode {
  return typeof val === 'string' && RESPONSIVE_MODES.has(val);
}

/** Validates whether a value is a valid layout strategy. */
export function isLayoutStrategy(val: unknown): val is PopoverLayoutStrategy {
  return typeof val === 'string' && LAYOUT_STRATEGIES.has(val);
}

