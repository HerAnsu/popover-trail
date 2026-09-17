/**
 * Spatial Boundary Clamping Operators for DnD Canvas (Re-export Facade).
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/dndClamp
 */

export {
  clampCoordinateToBounds,
  clampToViewport,
  clampToContainer,
  computeBoundaryProximityRatio,
} from '../utils/dragMath';
