/**
 * Positional Calculations for Cascading and Unpinned Layout Modes.
 *
 * @module hooks/geometry/cascadePosition
 */

import type { StoreApi } from 'zustand';
import type { TrailEntry, PopoverStore } from '../../types';
import { applySpatialCollisionNudge } from './collisionGeometry';

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
