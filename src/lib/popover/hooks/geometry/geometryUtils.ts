/**
 * Clean Barrel Re-export Facade for Viewport Geometry, Auto-placement, and Cascade Math.
 *
 * @module hooks/geometry/geometryUtils
 */

export {
  getViewportBounds,
  resolveMiddlewareProps,
  resolveAutoPlacement,
  resolveResponsivePosition,
} from './viewportGeometry';

export { applySpatialCollisionNudge } from './collisionGeometry';

export {
  baseCascadeOffset,
  computeCascadePosition,
  resolveUnpinnedPosition,
} from './cascadePosition';
