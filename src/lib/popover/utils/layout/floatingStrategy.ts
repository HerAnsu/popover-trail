/**
 * Relative Floating UI Layout Strategy for Side and Alignment Offsets.
 * Clean Architecture Layer 1: Core Kernel Geometry.
 *
 * @module utils/layout/floatingStrategy
 */

import { Point2D, type RectBounds } from '../valueObjects';
import type { LayoutStrategyParams, PopoverLayoutStrategyEngine } from './layoutStrategyTypes';

const PLACEMENT_OFFSET_STRATEGIES: Record<
  string,
  (trigger: RectBounds, offset: number) => Point2D
> = {
  bottom: (t, o) => new Point2D(t.left, t.bottom + o),
  'bottom-start': (t, o) => new Point2D(t.left, t.bottom + o),
  'bottom-end': (t, o) => new Point2D(t.right, t.bottom + o),
  top: (t, o) => new Point2D(t.left, t.top - o),
  'top-start': (t, o) => new Point2D(t.left, t.top - o),
  'top-end': (t, o) => new Point2D(t.right, t.top - o),
  right: (t, o) => new Point2D(t.right + o, t.top),
  'right-start': (t, o) => new Point2D(t.right + o, t.top),
  'right-end': (t, o) => new Point2D(t.right + o, t.bottom),
  left: (t, o) => new Point2D(t.left - o, t.top),
  'left-start': (t, o) => new Point2D(t.left - o, t.top),
  'left-end': (t, o) => new Point2D(t.left - o, t.bottom),
};

/**
 * Relative floating positioning layout strategy for anchor-relative cascading popovers.
 *
 * @example
 * ```typescript
 * const strategy = new RelativeFloatingLayoutStrategy();
 * const pos = strategy.computePosition({
 *   triggerRect: new RectBounds(100, 100, 50, 30),
 *   placement: 'bottom-start',
 *   offset: 8,
 * });
 * ```
 */
export class RelativeFloatingLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'floating-ui';

  /**
   * Computes the 2D position for a popover relative to its anchor trigger.
   *
   * @param params - Positioning context including trigger bounds, placement, and offset.
   * @returns 2D Point representing top-left coordinate.
   */
  computePosition(params: LayoutStrategyParams): Point2D {
    const trigger = params.triggerRect;
    if (!trigger) return new Point2D(0, 0);
    const offset = params.offset ?? 8;
    const placement = params.placement ?? 'bottom';
    const computeFn = PLACEMENT_OFFSET_STRATEGIES[placement] ?? PLACEMENT_OFFSET_STRATEGIES.bottom;
    return computeFn ? computeFn(trigger, offset) : new Point2D(0, 0);
  }
}
