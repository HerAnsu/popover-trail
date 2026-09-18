/**
 * Viewport Docked and Centered Overlay Layout Strategies.
 * Clean Architecture Layer 1: Core Kernel Geometry.
 *
 * @module utils/layout/dockedStrategies
 */

import { Point2D } from '../valueObjects';
import {
  type LayoutStrategyParams,
  type PopoverLayoutStrategyEngine,
  resolveViewportDimensions,
} from './layoutStrategyTypes';

/**
 * Fixed center layout strategy positioning popovers in the exact geometric center of the viewport.
 *
 * @example
 * ```typescript
 * const strategy = new FixedCenterLayoutStrategy();
 * const center = strategy.computePosition({ viewportWidth: 1920, viewportHeight: 1080 });
 * ```
 */
export class FixedCenterLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'fixed-center';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportWidth, viewportHeight } = resolveViewportDimensions(params);
    const popWidth = params.popoverRect?.width ?? 320;
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D((viewportWidth - popWidth) / 2, (viewportHeight - popHeight) / 2);
  }
}

/**
 * Bottom-docked layout strategy commonly used for bottom sheets on mobile devices.
 *
 * @example
 * ```typescript
 * const strategy = new DockedBottomLayoutStrategy();
 * const bottomPos = strategy.computePosition({ viewportHeight: 800 });
 * ```
 */
export class DockedBottomLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-bottom';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportHeight } = resolveViewportDimensions(params);
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D(0, viewportHeight - popHeight);
  }
}

/**
 * Top-docked layout strategy for banners or notification bars.
 *
 * @example
 * ```typescript
 * const strategy = new DockedTopLayoutStrategy();
 * const topPos = strategy.computePosition({});
 * ```
 */
export class DockedTopLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-top';

  computePosition(_params: LayoutStrategyParams): Point2D {
    return Point2D.zero();
  }
}
