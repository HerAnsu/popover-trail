/**
 * Pooled Execution Helpers for Spatial QuadTree Traversals.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialQueryPool
 */

import { sharedSetPool } from '../pool/spatialPools';

export function withPooledSeen<R>(fn: (seen: Set<string>) => R): R {
  return sharedSetPool.use(fn);
}
