/**
 * Clean Barrel Re-export Facade for Viewport Geometry, Auto-placement, and Cascade Math.
 *
 * @module hooks/geometry/geometryUtils
 */

export {
  getViewportBounds,
  resolveMiddlewareExtraProps,
  calculateAutoPlacement,
  calculateResponsivePosition,
} from './viewportGeometry';

export { applySpatialCollisionNudge } from './collisionGeometry';

export {
  calculateBaseOffsetPosition,
  computeCascadePosition,
  resolveUnpinnedLayoutPosition,
} from './cascadePosition';
