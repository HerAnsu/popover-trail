/**
 * Pluggable Layout Strategy Type Contracts.
 * Clean Architecture Layer 1: Core Kernel Geometry.
 *
 * @module utils/layout/layoutStrategyTypes
 */

import type { RectBounds, Point2D } from '../valueObjects';
import type { PopoverPlacement } from '../../types/configTypes';
import { isBrowser } from '../typeGuards';

export interface LayoutStrategyParams {
  triggerRect: RectBounds;
  popoverRect?: RectBounds;
  placement?: PopoverPlacement;
  offset?: number;
  viewportWidth?: number;
  viewportHeight?: number;
}

export interface PopoverLayoutStrategyEngine {
  readonly id: string;
  computePosition(params: LayoutStrategyParams): Point2D;
}

export function resolveViewportDimensions(params: LayoutStrategyParams): {
  viewportWidth: number;
  viewportHeight: number;
} {
  const isClient = isBrowser();
  return {
    viewportWidth: params.viewportWidth ?? (isClient ? window.innerWidth : 1024),
    viewportHeight: params.viewportHeight ?? (isClient ? window.innerHeight : 768),
  };
}
