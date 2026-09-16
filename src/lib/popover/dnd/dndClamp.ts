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

/**
 * Clamps coordinates within window/viewport bounds.
 */
export const clampToViewport = clampToWindowBounds;

/**
 * Clamps coordinates within container element bounds.
 */
export const clampToContainer = clampToContainerBounds;

export {
  clampCoordinateToBounds,
  computeBoundaryProximityRatio,
};
