/**
 * QuadTree Spatial Collision Detection and Lowest-Energy Cascade Placement.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/collisionGeometry
 */

import type { TrailEntry, DragOffset } from '../../types';
import { QuadTree, type BoundingBox, selectLowestEnergyPlacement } from '../../utils/quadTree';
import { ZERO_OFFSET } from '../../constants';

export function applySpatialCollisionNudge(
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
  const obstacles: BoundingBox[] = [];

  for (const sibling of activeFloating) {
    if (sibling.key !== id) {
      const off = activeOffsets[sibling.key] ?? ZERO_OFFSET;

      const bounds: BoundingBox = {
        x: (sibling.pinnedLayoutPos?.left ?? 0) + off.x,
        y: (sibling.pinnedLayoutPos?.top ?? 0) + off.y,
        width: 320,
        height: 240,
      };
      spatialTree.insert({ id: sibling.key, bounds });
      obstacles.push(bounds);
    }
  }

  const cardBox: BoundingBox = { x: left, y: top, width: 320, height: 240 };
  if (!spatialTree.hasCollision(cardBox)) {
    return { top, left };
  }

  const candidates = [
    { x: left + 16, y: top + 16 },
    { x: left + 32, y: top + 32 },
    { x: left, y: top + 24 },
    { x: left + 24, y: top },
    { x: left - 24, y: top + 24 },
  ];

  const optimal = selectLowestEnergyPlacement(
    candidates,
    { width: 320, height: 240 },
    obstacles,
    { x: left, y: top },
    0.5,
  );

  return optimal ? { top: optimal.y, left: optimal.x } : { top: top + 16, left: left + 16 };
}
