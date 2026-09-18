/**
 * QuadTree Spatial Collision Detection and Lowest-Energy Cascade Placement.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/geometry/collisionGeometry
 */

import type { TrailEntry, DragOffset } from '../../types';
import { QuadTree, type BoundingBox, selectLowestEnergyPlacement } from '../../utils/quadTree';
import { ZERO_OFFSET } from '../../constants';

/**
 * Checks for spatial collisions with active sibling cards and selects the lowest-energy non-overlapping position.
 * Populates a spatial QuadTree with active floating siblings, evaluates candidate nudge offsets,
 * and returns the optimal placement minimizing visual overlap and displacement distance.
 *
 * @param id - Key of the card being placed.
 * @param top - Initial computed top position.
 * @param left - Initial computed left position.
 * @param winWidth - Viewport inner width.
 * @param winHeight - Viewport inner height.
 * @param activeFloating - Active floating trail entries.
 * @param activeOffsets - Map of active card drag offsets.
 * @returns Nudged coordinates `{ top, left }`.
 *
 * @example
 * ```ts
 * const pos = applySpatialCollisionNudge('card-2', 100, 200, 1920, 1080, siblings, offsets);
 * ```
 */
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

  if (optimal) {
    const { x: optX, y: optY } = optimal;
    return { top: optY, left: optX };
  }
  return { top: top + 16, left: left + 16 };
}
