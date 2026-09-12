import { describe, it, expect } from 'vitest';
import { createBucketPool, findNextBucket } from './keyedPool';

describe('createBucketPool & findNextBucket', () => {
  it('finds next bucket size matching capacity', () => {
    const buckets = [16, 64, 256, 1024];
    expect(findNextBucket(buckets, 5)).toBe(16);
    expect(findNextBucket(buckets, 16)).toBe(16);
    expect(findNextBucket(buckets, 17)).toBe(64);
    expect(findNextBucket(buckets, 200)).toBe(256);
    expect(findNextBucket(buckets, 300)).toBe(1024);
    expect(findNextBucket(buckets, 2000)).toBe(1024);
  });

  it('allocates and recycles buffers from tiered buckets', () => {
    const bucketPool = createBucketPool(
      [16, 64, 256],
      (size) => new Float32Array(size),
      (arr) => arr.fill(0),
    );

    const buf10 = bucketPool.acquireBucket(10);
    expect(buf10).toHaveLength(16);

    const buf50 = bucketPool.acquireBucket(50);
    expect(buf50).toHaveLength(64);

    buf10[0] = 42;
    bucketPool.release(16, buf10);

    const recycled = bucketPool.acquireBucket(12);
    expect(recycled).toBe(buf10);
    expect(recycled[0]).toBe(0);
  });
});
