/**
 * Specialized Built-In Pools for High-Frequency Spatial Geometry.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/spatialPools
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { Pool } from './pool';
import { globalPoolRegistry } from './poolRegistry';

/**
 * Mutable 2D coordinate point object managed by object pools to eliminate GC churn.
 */
export interface PooledPoint {
  x: number;
  y: number;
}

/**
 * Mutable 2D bounding box structure managed by object pools to eliminate GC churn.
 */
export interface PooledBox extends BoundingBox {
  top: number;
  left: number;
}

/**
 * Creates an object pool of mutable 2D points (`{ x, y }`).
 *
 * @param initial - Initial pre-allocated capacity (default: 32).
 * @param max - Maximum pool capacity before overflow items are discarded (default: 256).
 * @returns A `Pool<PooledPoint>` instance.
 *
 * @example
 * ```ts
 * const pointPool = createPointPool(16, 64);
 * const pt = pointPool.acquire();
 * pt.x = 100;
 * pt.y = 200;
 * pointPool.release(pt);
 * ```
 */
export function createPointPool(initial = 32, max = 256): Pool<PooledPoint> {
  return Pool.create<PooledPoint>(() => ({ x: 0, y: 0 }), {
    reset: (pt) => {
      pt.x = 0;
      pt.y = 0;
    },
    initialCapacity: initial,
    maxCapacity: max,
  });
}

/**
 * Creates an object pool of mutable bounding box objects (`{ x, y, top, left, width, height }`).
 *
 * @param initial - Initial pre-allocated capacity (default: 16).
 * @param max - Maximum pool capacity before overflow items are discarded (default: 128).
 * @returns A `Pool<PooledBox>` instance.
 *
 * @example
 * ```ts
 * const boxPool = createBoxPool(8, 32);
 * const box = boxPool.acquire();
 * box.width = 300;
 * box.height = 150;
 * boxPool.release(box);
 * ```
 */
export function createBoxPool(initial = 16, max = 128): Pool<PooledBox> {
  return Pool.create<PooledBox>(
    () => ({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 }),
    {
      reset: (box) => {
        box.x = 0;
        box.y = 0;
        box.top = 0;
        box.left = 0;
        box.width = 0;
        box.height = 0;
      },
      initialCapacity: initial,
      maxCapacity: max,
    },
  );
}

/**
 * Creates an object pool of reusable `Set<T>` instances, automatically cleared on release.
 *
 * @template T - Type of items stored in the set.
 * @param initial - Initial capacity (default: 8).
 * @param max - Maximum capacity (default: 64).
 * @returns A `Pool<Set<T>>` instance.
 *
 * @example
 * ```ts
 * const setPool = createSetPool<string>(4, 16);
 * const set = setPool.acquire();
 * set.add('item-1');
 * setPool.release(set); // automatically clears the set
 * ```
 */
export function createSetPool<T = string>(initial = 8, max = 64): Pool<Set<T>> {
  return Pool.create<Set<T>>(() => new Set<T>(), {
    reset: (set) => set.clear(),
    initialCapacity: initial,
    maxCapacity: max,
  });
}

/**
 * Pre-allocated singleton point pool for high-frequency interaction calculations (pointer move, drag physics).
 */
export const sharedPointPool = createPointPool(64, 512);

/**
 * Pre-allocated singleton bounding box pool for layout geometry calculations and viewport clipping.
 */
export const sharedBoxPool = createBoxPool(32, 256);

/**
 * Pre-allocated singleton Set pool for transient graph traversal and cycle detection routines.
 */
export const sharedSetPool = createSetPool<string>(8, 64);

globalPoolRegistry.register('spatial-point', sharedPointPool);
globalPoolRegistry.register('spatial-box', sharedBoxPool);
globalPoolRegistry.register('spatial-set', sharedSetPool);
