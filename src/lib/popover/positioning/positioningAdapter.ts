/**
 * Positioning Adapter Port Interface.
 * Clean Architecture Layer 1: Core Kernel / Interface Port.
 *
 * @module positioning/positioningAdapter
 */

import type { VirtualElement, Placement } from '@floating-ui/react';

export interface PositionCoordinates {
  readonly x: number;
  readonly y: number;
  readonly placement: Placement;
}

export interface PositionComputeOptions {
  readonly placement?: Placement;
  readonly offset?: number;
  readonly flip?: boolean;
  readonly shift?: boolean;
  readonly autoPlacement?: boolean;
}

export interface PositioningAdapter {
  computePosition(
    anchor: HTMLElement | VirtualElement,
    card: HTMLElement,
    options?: PositionComputeOptions,
  ): Promise<PositionCoordinates>;
}
