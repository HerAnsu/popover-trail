/**
 * Positional Calculations for Cascading and Unpinned Layout Modes.
 *
 * @module hooks/geometry/cascadePosition
 */

import type { StoreApi } from 'zustand';
import type { TrailEntry, PopoverStore } from '../../types';
import { applySpatialCollisionNudge } from './collisionGeometry';

/**
 * Computes the directional cascade coordinate offset based on an entry's z-index and step size.
 *
 * @param zIndex - Relative stack index (0 for root, 1 for first child, etc.).
 * @param step - Pixel offset distance per stack level.
 * @param direction - Direction to cascade ('left' | 'right' | 'top' | 'bottom').
 * @param y - Base anchor Y coordinate.
 * @param x - Base anchor X coordinate.
 * @returns An object containing `{ baseTop, baseLeft }`.
 *
 * @example
 * ```ts
 * const pos = calculateBaseOffsetPosition(2, 24, 'right', 100, 200);
 * // returns { baseTop: 100, baseLeft: 248 }
 * ```
 */
export function calculateBaseOffsetPosition(
  zIndex: number,
  step: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
  y: number,
  x: number,
): { baseTop: number; baseLeft: number } {
  const offsetVal = zIndex * step;
  if (direction === 'left') return { baseTop: y, baseLeft: x - offsetVal };
  if (direction === 'right') return { baseTop: y, baseLeft: x + offsetVal };
  if (direction === 'top') return { baseTop: y - offsetVal, baseLeft: x };
  return { baseTop: y + offsetVal, baseLeft: x };
}

/**
 * Calculates final floating coordinates for a cascading popover card, optionally nudging
 * to avoid spatial collisions with siblings when `enableSpatialCollision` is true.
 *
 * @param options - Configuration object containing positioning coordinates and store reference.
 * @returns Final layout coordinates `{ top, left }`.
 *
 * @example
 * ```ts
 * const pos = computeCascadePosition({
 *   zIndex: 1,
 *   step: 24,
 *   direction: 'right',
 *   y: 150,
 *   x: 300,
 *   enableSpatialCollision: true,
 *   storeApi,
 *   id: 'card-2',
 *   winWidth: 1920,
 *   winHeight: 1080,
 * });
 * ```
 */
export function computeCascadePosition({
  zIndex,
  step,
  direction,
  y,
  x,
  enableSpatialCollision,
  storeApi,
  id,
  winWidth,
  winHeight,
}: {
  zIndex: number;
  step: number;
  direction?: 'left' | 'right' | 'top' | 'bottom';
  y: number;
  x: number;
  enableSpatialCollision?: boolean;
  storeApi: StoreApi<PopoverStore<unknown, unknown>>;
  id: string;
  winWidth: number;
  winHeight: number;
}): { top: number; left: number } {
  const effectiveDirection = direction ?? 'right';
  const { baseTop, baseLeft } = calculateBaseOffsetPosition(zIndex, step, effectiveDirection, y, x);

  if (enableSpatialCollision) {
    const { floating: activeFloating, offsets: activeOffsets } = storeApi.getState();
    return applySpatialCollisionNudge(
      id,
      baseTop,
      baseLeft,
      winWidth,
      winHeight,
      activeFloating,
      activeOffsets,
    );
  }

  return {
    top: baseTop,
    left: baseLeft,
  };
}

/**
 * Resolves the unpinned layout position for a popover card.
 * Prioritizes persisted `pinnedLayoutPos` if present; otherwise derives cascade placement from Floating UI placement.
 *
 * @param id - Card key identifier.
 * @param entry - Trail entry.
 * @param cascadeOffsetStep - Stepping offset distance in pixels.
 * @param resolvedPlacement - Placement string from floating UI (e.g. 'bottom-start', 'right').
 * @param zIndex - Stack level index.
 * @param y - Floating UI computed top coordinate.
 * @param x - Floating UI computed left coordinate.
 * @param enableSpatialCollision - Whether to run lowest-energy collision avoidance.
 * @param storeApi - Zustand store handle.
 * @param winWidth - Viewport inner width.
 * @param winHeight - Viewport inner height.
 * @returns Final layout coordinates `{ top, left }`.
 *
 * @example
 * ```ts
 * const pos = resolveUnpinnedLayoutPosition(
 *   'card-1',
 *   entry,
 *   24,
 *   'right-start',
 *   0,
 *   100,
 *   200,
 *   false,
 *   storeApi,
 *   1024,
 *   768,
 * );
 * ```
 */
export function resolveUnpinnedLayoutPosition(
  id: string,
  entry: TrailEntry | undefined,
  cascadeOffsetStep: number,
  resolvedPlacement: string | undefined,
  zIndex: number,
  y: number | null,
  x: number | null,
  enableSpatialCollision: boolean | undefined,
  storeApi: StoreApi<PopoverStore<unknown, unknown>>,
  winWidth: number,
  winHeight: number,
): { top: number; left: number } {
  if (entry?.pinnedLayoutPos) {
    return { top: entry.pinnedLayoutPos.top, left: entry.pinnedLayoutPos.left };
  }

  let direction: 'left' | 'right' | 'top' | 'bottom' = 'bottom';
  if (resolvedPlacement?.startsWith('left')) {
    direction = 'left';
  } else if (resolvedPlacement?.startsWith('right')) {
    direction = 'right';
  } else if (resolvedPlacement?.startsWith('top')) {
    direction = 'top';
  }

  return computeCascadePosition({
    zIndex,
    step: cascadeOffsetStep,
    direction,
    y: y ?? 0,
    x: x ?? 0,
    enableSpatialCollision,
    storeApi,
    id,
    winWidth,
    winHeight,
  });
}
