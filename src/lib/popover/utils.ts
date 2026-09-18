/**
 * Mathematical, algorithmic, spatial, and functional utilities for popover-trail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils
 */

// Algebraic Monads & Results
export * from './utils/result';

// Mathematics, Geometry & Affine Transforms
export * from './utils/math';
export * from './utils/dragMath';
export * from './utils/dragPhysics';
export * from './utils/dragBounds';
export * from './utils/dragRectClamping';
export * from './utils/stylesTransform';
export * from './utils/spatial';
export { RectBounds, Point2D } from './utils/valueObjects';

// Directed Acyclic Graph (DAG) Algorithms
export * from './utils/dag';

// Collections, Records, Objects & Set Operations
export * from './utils/collections';
export * from './utils/cleanObject';
export * from './utils/setOperations';
export * from './utils/arrayUtils';
export * from './utils/equality';

// Functional Combinators & Predicates
export * from './utils/functional';
export * from './utils/predicates';

// String Manipulation & Formatting
export * from './utils/stringUtils';

// Diagnostics, Errors & Invariant Guards
export * from './utils/errors';
export * from './utils/invariant';
export * from './utils/assertNever';
export * from './utils/typeGuards';
export * from './utils/safeKeys';
export * from './utils/a11y';
export * from './utils/clsx';

// Resource Management & Disposables
export * from './utils/resource';
export * from './utils/pool';
export * from './utils/buffer';
export * from './utils/cache';

// Async Utilities
export * from './utils/asyncUtils';
