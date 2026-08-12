/**
 * Pluggable Layout Strategies for popover positioning calculations.
 * Replaces monolithic branching logic with decoupled, testable strategy classes.
 *
 * @module layoutStrategies
 */

import { Point2D, RectBounds } from './valueObjects';
import type { PopoverPlacement } from '../types/configTypes';

/** Parameters object passed to layout strategies. */
export interface LayoutStrategyParams {
  triggerRect: RectBounds;
  popoverRect?: RectBounds;
  placement?: PopoverPlacement;
  offset?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

/** Strategy interface for popover placement positioning. */
export interface PopoverLayoutStrategyEngine {
  readonly id: string;
  computePosition(params: LayoutStrategyParams): Point2D;
}

function resolveViewportDimensions(params: LayoutStrategyParams): {
  viewportWidth: number;
  viewportHeight: number;
} {
  const isClient = typeof window !== 'undefined';
  return {
    viewportWidth: params.viewportWidth ?? (isClient ? window.innerWidth : 1024),
    viewportHeight: params.viewportHeight ?? (isClient ? window.innerHeight : 768),
  };
}

/** Strategy computing fixed-center viewport overlay positions. */
export class FixedCenterLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'fixed-center';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportWidth, viewportHeight } = resolveViewportDimensions(params);
    const popWidth = params.popoverRect?.width ?? 320;
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D((viewportWidth - popWidth) / 2, (viewportHeight - popHeight) / 2);
  }
}

/** Strategy computing docked-bottom viewport sheet positions. */
export class DockedBottomLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-bottom';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportHeight } = resolveViewportDimensions(params);
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D(0, viewportHeight - popHeight);
  }
}

/** Strategy computing docked-top navigation bar positions. */
export class DockedTopLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-top';

  computePosition(): Point2D {
    return Point2D.zero();
  }
}

const PLACEMENT_OFFSET_STRATEGIES: Record<
  string,
  (trigger: RectBounds, offset: number) => Point2D
> = {
  bottom: (t, o) => new Point2D(t.left, t.bottom + o),
  'bottom-start': (t, o) => new Point2D(t.left, t.bottom + o),
  top: (t, o) => new Point2D(t.left, t.top - o),
  'top-start': (t, o) => new Point2D(t.left, t.top - o),
  right: (t, o) => new Point2D(t.right + o, t.top),
  'right-start': (t, o) => new Point2D(t.right + o, t.top),
  left: (t, o) => new Point2D(t.left - o, t.top),
  'left-start': (t, o) => new Point2D(t.left - o, t.top),
};

/** Default relative Floating-UI layout strategy. */
export class RelativeFloatingLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'floating-ui';

  computePosition(params: LayoutStrategyParams): Point2D {
    const trigger = params.triggerRect;
    if (!trigger) return new Point2D(0, 0);
    const offset = params.offset ?? 8;
    const placement = params.placement ?? 'bottom';
    const computeFn = PLACEMENT_OFFSET_STRATEGIES[placement] ?? PLACEMENT_OFFSET_STRATEGIES.bottom;
    return computeFn ? computeFn(trigger, offset) : new Point2D(0, 0);
  }
}

export const relativeFloatingLayoutStrategy = new RelativeFloatingLayoutStrategy();
export const fixedCenterLayoutStrategy = new FixedCenterLayoutStrategy();
export const dockedBottomLayoutStrategy = new DockedBottomLayoutStrategy();
export const dockedTopLayoutStrategy = new DockedTopLayoutStrategy();

/** Strategy Registry Manager for layout positioning. */
export class LayoutStrategyRegistry {
  private readonly strategies = new Map<string, PopoverLayoutStrategyEngine>();

  constructor() {
    this.register(relativeFloatingLayoutStrategy);
    this.register(fixedCenterLayoutStrategy);
    this.register(dockedBottomLayoutStrategy);
    this.register(dockedTopLayoutStrategy);
  }

  register(strategy: PopoverLayoutStrategyEngine): void {
    this.strategies.set(strategy.id, strategy);
  }

  get(id: string): PopoverLayoutStrategyEngine {
    return this.strategies.get(id) ?? relativeFloatingLayoutStrategy;
  }
}

export const globalLayoutStrategyRegistry = new LayoutStrategyRegistry();
