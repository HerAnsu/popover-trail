/**
 * Spatial Boundary Clamping Operators for DnD Canvas (Re-export Facade).
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndClamp
 */

import {
  clampCoordinateToBounds,
  clampToWindowBounds,
  clampToContainerBounds,
  computeBoundaryProximityRatio,
} from '../utils/dragMath';

export {
  clampCoordinateToBounds,
  clampToWindowBounds,
  clampToContainerBounds,
  computeBoundaryProximityRatio,
};

/**
 * Clamps coordinates within window/viewport bounds.
 * Alias for {@link clampToWindowBounds}.
 */
export const clampToViewport = clampToWindowBounds;

/**
 * Clamps coordinates within container element bounds.
 * Alias for {@link clampToContainerBounds}.
 */
export const clampToContainer = clampToContainerBounds;
