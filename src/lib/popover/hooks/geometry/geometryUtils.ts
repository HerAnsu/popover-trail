import type { Placement } from '@floating-ui/react';
import type { TrailEntry, DragOffset, PopoverStore } from '../../types';
import type { StoreApi } from 'zustand';
import { QuadTree, type BoundingBox } from '../../utils/quadTree';

/**
 * Helper to safely measure current viewport bounds across SSR and browser environments.
 */
export function getViewportBounds(): { width: number; height: number } {
  const isClient = typeof window !== 'undefined';
  return {
    width: isClient ? window.innerWidth : 1024,
    height: isClient ? window.innerHeight : 768,
  };
}

/** Pure helper to extract middleware extra properties. */
export function resolveMiddlewareExtraProps(option: unknown): Record<string, unknown> {
  return typeof option === 'object' && option !== null ? { ...option } : {};
}

/**
 * Heuristic auto-placement resolver:
 * Automatically picks `'left'` or `'right'` based on whether the anchor trigger is positioned
 * on the right half or left half of the viewport, ensuring popovers naturally open towards center.
 */
export function calculateAutoPlacement(
  placement: Placement | 'auto' | undefined,
  anchorRect: DOMRect | null | undefined,
): Placement | undefined {
  if (placement !== 'auto') return placement;
  if (!anchorRect) return 'right';

  const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;

  return anchorCenterX > screenCenterX ? 'left' : 'right';
}

/**
 * Calculates absolute layout coordinates for transformed responsive modes:
 * - `bottom-sheet`: Docked to bottom edge of mobile viewport.
 * - `modal`: Centered in the middle of viewport with safety margins.
 * - `docked-top`: Anchored to top edge navigation bar.
 */
export function calculateResponsivePosition(
  effectiveResponsiveMode: string | undefined,
  isMobileViewport: boolean,
  layoutStrategy: string | undefined,
  winWidth: number,
  winHeight: number,
): { top: number; left: number } | null {
  if (
    effectiveResponsiveMode === 'bottom-sheet' ||
    (effectiveResponsiveMode === 'auto' && isMobileViewport) ||
    layoutStrategy === 'docked-bottom'
  ) {
    return {
      top: Math.max(0, winHeight - 320),
      left: Math.max(0, (winWidth - 400) / 2),
    };
  }

  if (effectiveResponsiveMode === 'modal' || layoutStrategy === 'fixed-center') {
    return {
      top: Math.max(20, (winHeight - 350) / 2),
      left: Math.max(20, (winWidth - 400) / 2),
    };
  }

  if (layoutStrategy === 'docked-top') {
    return {
      top: 10,
      left: Math.max(0, (winWidth - 400) / 2),
    };
  }

  return null;
}

/**
 * Uses a QuadTree index to check if a new popover card overlaps with existing floating windows.
 * If a collision is detected, applies a 16px diagonal nudge offset.
 */
function applySpatialCollisionNudge(
  id: string,
  top: number,
  left: number,
  winWidth: number,
  winHeight: number,
  activeFloating: readonly TrailEntry<unknown>[],
  activeOffsets: Readonly<Partial<Record<string, Readonly<DragOffset>>>>,
): { top: number; left: number } {
  const spatialBounds: BoundingBox = { x: 0, y: 0, width: winWidth, height: winHeight };
  const spatialTree = new QuadTree(spatialBounds);

  for (const sibling of activeFloating) {
    if (sibling.key !== id) {
      const off = activeOffsets[sibling.key] ?? { x: 0, y: 0 };
      spatialTree.insert({
        id: sibling.key,
        bounds: {
          x: (sibling.pinnedLayoutPos?.left ?? 0) + off.x,
          y: (sibling.pinnedLayoutPos?.top ?? 0) + off.y,
          width: 320,
          height: 240,
        },
      });
    }
  }

  const cardBox = { x: left, y: top, width: 320, height: 240 };
  spatialTree.insert({ id, bounds: cardBox });

  const collisions = spatialTree.retrieve([], cardBox);
  if (collisions.length > 1) {
    return { top: top + 16, left: left + 16 };
  }
  return { top, left };
}

function calculateBaseOffsetPosition(
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
