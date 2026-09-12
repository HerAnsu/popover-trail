/**
 * Specialized Built-In Pools for High-Frequency Spatial Geometry.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/spatialPools
 */

import type { BoundingBox } from '../guards/spatialGuards';
import { ObjectPool } from './objectPoolCore';
import { globalPoolRegistry } from './poolRegistry';

export interface PooledPoint {
  x: number;
  y: number;
}

export interface PooledBox extends BoundingBox {
  top: number;
  left: number;
}

export function createPointPool(initial = 32, max = 256): ObjectPool<PooledPoint> {
  return new ObjectPool<PooledPoint>({
    factory: () => ({ x: 0, y: 0 }),
    reset: (pt) => {
      pt.x = 0;
      pt.y = 0;
    },
    initialCapacity: initial,
    maxCapacity: max,
  });
}

export function createBoxPool(initial = 16, max = 128): ObjectPool<PooledBox> {
  return new ObjectPool<PooledBox>({
    factory: () => ({ x: 0, y: 0, top: 0, left: 0, width: 0, height: 0 }),
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
  });
}

export function createSetPool<T = string>(initial = 8, max = 64): ObjectPool<Set<T>> {
  return new ObjectPool<Set<T>>({
    factory: () => new Set<T>(),
    reset: (set) => set.clear(),
    initialCapacity: initial,
    maxCapacity: max,
  });
}

export const sharedPointPool = createPointPool(64, 512);
export const sharedBoxPool = createBoxPool(32, 256);
export const sharedSetPool = createSetPool<string>(8, 64);

globalPoolRegistry.register('spatial-point', sharedPointPool);
globalPoolRegistry.register('spatial-box', sharedBoxPool);
globalPoolRegistry.register('spatial-set', sharedSetPool);
