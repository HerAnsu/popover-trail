/**
 * Unified 2D Spatial Indexing Barrel.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial
 */

export * from './spatialBounds';
export * from './spatialSubdivide';
export * from './spatialAABB';
export * from './spatialEnergy';
export * from './spatialCorridor';
export * from './spatialKNN';
export * from './spatialInsert';
export * from './spatialQuery';
export * from './spatialAffine';
export * from './spatialCoalesce';
export * from './spatialAABBInto';
export * from './spatialClusters';
export * from './spatialSnapshot';
export * from './spatialQueryPool';
export * from './quadTreeCore';

export {
  type BoundingBox,
  type QuadItem,
  boxesIntersect,
  isValidQuadItem,
} from '../guards/spatialGuards';
