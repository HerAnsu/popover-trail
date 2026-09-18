/**
 * Pooled Execution Helpers for Spatial QuadTree Traversals.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialQueryPool
 */

import { sharedSetPool } from '../pool/spatialPools';
import type { Pooled } from '../pool/poolTypes';

/**
 * Borrows a pooled tracking set for QuadTree traversal with RAII `using` semantics.
 * Eliminates callback closure allocations on hot traversal paths.
 *
 * @example
 * ```typescript
 * using seen = borrowPooledSeen();
 * visitQuadItems(nodes, items, bounds, target, visitor, seen);
 * ```
 */
export function borrowPooledSeen(): Pooled<Set<string>> {
  return sharedSetPool.borrow();
}

/**
 * Executes a callback with a leased tracking set from `sharedSetPool`.
 *
 * @param fn - Callback receiving the pooled set.
 * @returns Result of the callback invocation.
 */
export function withPooledSeen<R>(fn: (seen: Set<string>) => R): R {
  return sharedSetPool.use(fn);
}
