/**
 * Positioning Adapter Port Interface.
 * Clean Architecture Layer 1: Core Kernel / Interface Port.
 *
 * @module positioning/positioningAdapter
 */

import type { VirtualElement, Placement } from '@floating-ui/react';

/**
 * Resolved 2D coordinates and effective placement for a positioned element.
 *
 * @example
 * ```typescript
 * const coords: PositionCoordinates = {
 *   x: 150,
 *   y: 220,
 *   placement: 'bottom-start',
 * };
 * ```
 */
export interface PositionCoordinates {
  /** The computed horizontal X coordinate in pixels relative to viewport or offset parent. */
  readonly x: number;
  /** The computed vertical Y coordinate in pixels relative to viewport or offset parent. */
  readonly y: number;
  /** The final resolved placement after applying collision and flip middleware. */
  readonly placement: Placement;
}

/**
 * Configuration options passed to a positioning adapter to compute coordinates.
 *
 * @example
 * ```typescript
 * const options: PositionComputeOptions = {
 *   placement: 'bottom-start',
 *   offset: 8,
 *   flip: true,
 *   shift: true,
 * };
 * ```
 */
export interface PositionComputeOptions {
  /** Preferred placement of the floating element relative to the anchor. */
  readonly placement?: Placement;
  /** Distance in pixels between anchor and card along the main alignment axis. */
  readonly offset?: number;
  /** Whether to flip to the opposite placement when colliding with viewport boundaries. */
  readonly flip?: boolean;
  /** Whether to shift along cross-axis to stay within viewport bounds. */
  readonly shift?: boolean;
  /** Whether to automatically select the placement with the most available space. */
  readonly autoPlacement?: boolean;
}

/**
 * Adapter interface port for calculating floating element positions.
 * Decouples core logic from concrete floating implementations (e.g. Floating UI).
 *
 * @example
 * ```typescript
 * const adapter: PositioningAdapter = {
 *   async computePosition(anchor, card, options) {
 *     return { x: 100, y: 200, placement: options?.placement ?? 'bottom' };
 *   },
 * };
 * ```
 */
export interface PositioningAdapter {
  /**
   * Computes the 2D floating position coordinates for a card relative to an anchor.
   *
   * @param anchor - DOM HTMLElement or virtual bounding rect element acting as the reference anchor.
   * @param card - DOM HTMLElement representing the floating popover card to position.
   * @param options - Optional positioning configuration (placement, offset, collision flags).
   * @returns Promise resolving to the computed coordinates and final placement.
   */
  computePosition(
    anchor: HTMLElement | VirtualElement,
    card: HTMLElement,
    options?: PositionComputeOptions,
  ): Promise<PositionCoordinates>;
}

