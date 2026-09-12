/**
 * Magnetic Snapping Modifier for DnD Canvas.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndSnap
 */

import type { Modifier } from '@dnd-kit/core';
import { findMagneticSnap, type BoundingBox } from '../utils/spatial';
import { sharedBoxPool } from '../utils/pool/spatialPools';

export interface SnapTargetRect {
  readonly id: string;
  readonly rect: BoundingBox;
}

export function createMagneticSnapModifier(
  getObstacles: () => readonly SnapTargetRect[],
  threshold = 12,
): Modifier {
  return ({ transform, activeNodeRect, active }) => {
    if (!activeNodeRect || !active) return transform;

    const currentBounds = sharedBoxPool.acquire();
    try {
      currentBounds.x = activeNodeRect.left + transform.x;
      currentBounds.y = activeNodeRect.top + transform.y;
      currentBounds.width = activeNodeRect.width;
      currentBounds.height = activeNodeRect.height;

      const activeId = String(active.id);
      const allTargets = getObstacles();
      const obstacles: BoundingBox[] = [];
      for (const t of allTargets) {
        if (t && t.id !== activeId) {
          obstacles.push(t.rect);
        }
      }

      if (obstacles.length === 0) return transform;

      const snap = findMagneticSnap(currentBounds, obstacles, threshold);

      return {
        ...transform,
        x: snap.snapX !== undefined ? snap.snapX - activeNodeRect.left : transform.x,
        y: snap.snapY !== undefined ? snap.snapY - activeNodeRect.top : transform.y,
      };
    } finally {
      sharedBoxPool.release(currentBounds);
    }
  };
}
