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

export class FixedCenterLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'fixed-center';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportWidth, viewportHeight } = resolveViewportDimensions(params);
    const popWidth = params.popoverRect?.width ?? 320;
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D((viewportWidth - popWidth) / 2, (viewportHeight - popHeight) / 2);
  }
}

export class DockedBottomLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-bottom';

  computePosition(params: LayoutStrategyParams): Point2D {
    const { viewportHeight } = resolveViewportDimensions(params);
    const popHeight = params.popoverRect?.height ?? 240;

    return new Point2D(0, viewportHeight - popHeight);
  }
}

export class DockedTopLayoutStrategy implements PopoverLayoutStrategyEngine {
  readonly id = 'docked-top';

  computePosition(_params: LayoutStrategyParams): Point2D {
    return Point2D.zero();
  }
}
