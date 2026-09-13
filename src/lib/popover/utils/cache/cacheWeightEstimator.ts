/**
 * Memory footprint estimation for arbitrary cache entries.
 *
 * @module cache/cacheWeightEstimator
 */

import { isArray } from '../guards/arrayGuards';

export function estimateByteWeight(value: unknown, depth = 0, maxDepth = 2): number {
  if (value === null || value === undefined) return 0;
  const type = typeof value;

  if (type === 'number') return 8;
  if (type === 'boolean') return 4;
  if (typeof value === 'string') return value.length * 2;
  if (type === 'bigint') return 16;
  if (type === 'symbol' || type === 'function') return 32;

  if (type === 'object') {
    if (depth >= maxDepth) return 32;

    if (isArray(value)) {
      let arrayBytes = 16;
      const limit = Math.min(value.length, 50);
      for (let i = 0; i < limit; i++) {
        arrayBytes += estimateByteWeight(value[i], depth + 1, maxDepth);
      }
      return arrayBytes;
    }

    let objBytes = 32;
    let count = 0;
    const entries = Object.entries(value);
    for (const [key, propVal] of entries) {
      objBytes += key.length * 2 + estimateByteWeight(propVal, depth + 1, maxDepth);
      count++;
      if (count >= 50) break;
    }
    return objBytes;
  }

  return 16;
}
