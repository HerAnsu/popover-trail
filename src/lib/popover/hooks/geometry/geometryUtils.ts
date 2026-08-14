import type { Placement } from '@floating-ui/react';
import type { TrailEntry } from '../../types';
import { QuadTree, type BoundingBox } from '../../utils/quadTree';
import type { usePopoverStoreApi } from '../../context/usePopoverStore';

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
  return typeof option === 'object' && option !== null ? (option as Record<string, unknown>) : {};
}

/** Pure calculation helper for resolving auto placement based on viewport coordinates. */
export function calculateAutoPlacement(
  placement: string | undefined,
  anchorRect: DOMRect | null | undefined,
): Placement | undefined {
  if (placement !== 'auto') return placement as Placement | undefined;
  if (!anchorRect) return 'right' as Placement;

  const screenCenterX = typeof window !== 'undefined' ? window.innerWidth / 2 : 500;
  const anchorCenterX = anchorRect.left + anchorRect.width / 2;

  return (anchorCenterX > screenCenterX ? 'left' : 'right') as Placement;
}

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

function calculateCascadeOffset(
  zIndex: number,
  step: number,
  direction: 'left' | 'right' | 'top' | 'bottom',
): { topOffset: number; leftOffset: number } {
  const offsetVal = zIndex * step;
  if (direction === 'left') return { topOffset: 0, leftOffset: -offsetVal };
  if (direction === 'right') return { topOffset: 0, leftOffset: offsetVal };
  if (direction === 'top') return { topOffset: -offsetVal, leftOffset: 0 };
  return { topOffset: offsetVal, leftOffset: 0 };
}

function applySpatialCollisionNudge(
  id: string,
  top: number,
  left: number,
  winWidth: number,
  winHeight: number,
  activeFloating: readonly TrailEntry<unknown>[],
  activeOffsets: Record<string, { x: number; y: number }>,
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
  y: number | null,
  x: number | null,
): { baseTop: number; baseLeft: number } {
  const { topOffset, leftOffset } = calculateCascadeOffset(zIndex, step, direction);
  return {
    baseTop: (y ?? 0) + topOffset,
    baseLeft: (x ?? 0) + leftOffset,
  };
}

export function resolveUnpinnedLayoutPosition(
  id: string,
  entry: TrailEntry | undefined,
  cascadeOffsetStep: number,
  resolvedPlacement: string,
  zIndex: number,
  y: number | null,
  x: number | null,
  enableSpatialCollision: boolean,
  storeApi: ReturnType<typeof usePopoverStoreApi>,
  winWidth: number,
  winHeight: number,
): { top: number; left: number } {
  const step = entry?.cascadeOffsetStep ?? cascadeOffsetStep;
  const direction = (entry?.cascadeOffsetDirection ??
    (resolvedPlacement.startsWith('left') ? 'left' : 'right')) as
    | 'left'
    | 'right'
    | 'top'
    | 'bottom';
  const { baseTop, baseLeft } = calculateBaseOffsetPosition(zIndex, step, direction, y, x);

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
