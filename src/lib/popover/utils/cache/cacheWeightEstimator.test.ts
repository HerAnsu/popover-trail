import { describe, it, expect } from 'vitest';
import { estimateByteWeight } from './cacheWeightEstimator';
import { SimplePopoverCache } from './SimplePopoverCache';

describe('cacheWeightEstimator', () => {
  it('estimates byte sizes across primitive types', () => {
    expect(estimateByteWeight(null)).toBe(0);
    expect(estimateByteWeight(undefined)).toBe(0);
    expect(estimateByteWeight(42)).toBe(8);
    expect(estimateByteWeight(true)).toBe(4);
    expect(estimateByteWeight('hello')).toBe(10); // 5 chars * 2
  });

  it('estimates object and array compound structures', () => {
    const obj = { name: 'Alice', age: 30 };
    // 32 + (4*2 + 10) + (3*2 + 8) = 32 + 18 + 14 = 64
    expect(estimateByteWeight(obj)).toBeGreaterThan(32);

    const arr = [1, 2, 3];
    // 16 + 8*3 = 40
    expect(estimateByteWeight(arr)).toBe(40);
  });

  it('automatically calculates weight when autoEstimateWeight is enabled', () => {
    const cache = new SimplePopoverCache<string>(60000, 100);
    cache.set('key1', 'hello world', { autoEstimateWeight: true });

    const entry = cache.dump().find(([k]) => k === 'key1')?.[1];
    expect(entry?.weight).toBe(22); // 'hello world' is 11 chars * 2
  });
});
