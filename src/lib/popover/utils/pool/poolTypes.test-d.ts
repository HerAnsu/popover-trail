import { describe, it, expectTypeOf } from 'vitest';
import {
  ObjectPool,
  type PoolCapacity,
  type PoolSize,
  type PoolTimeoutMs,
  type PoolDomainError,
  type InvalidPoolOptionsError,
  type ObjectPoolMetrics,
  createArrayPool,
  createMapPool,
} from './index';
import type { Result } from '../result';

describe('poolTypes static type assertions', () => {
  it('enforces nominal branding on dimensions', () => {
    expectTypeOf<PoolCapacity>().not.toEqualTypeOf<PoolSize>();
    expectTypeOf<PoolSize>().not.toEqualTypeOf<PoolTimeoutMs>();
    expectTypeOf<PoolCapacity>().toMatchTypeOf<number>();
  });

  it('enforces monadic types on ObjectPool methods', () => {
    const pool = new ObjectPool(() => ({ id: 'node-1' }));

    expectTypeOf(pool.acquire()).toEqualTypeOf<{ id: string }>();
    expectTypeOf(pool.acquireResult()).toEqualTypeOf<Result<{ id: string }, PoolDomainError>>();

    expectTypeOf(
      pool.useResult((): Result<number, string> => ({ success: true, data: 42 })),
    ).toEqualTypeOf<Result<number, string>>();

    expectTypeOf(pool.size).toBeNumber();
    expectTypeOf(pool.capacity).toBeNumber();
    expectTypeOf(pool.getMetrics()).toEqualTypeOf<ObjectPoolMetrics>();
  });

  it('enforces ObjectPool.create return type', () => {
    const res = ObjectPool.create({ factory: () => 42 });
    expectTypeOf(res).toEqualTypeOf<Result<ObjectPool<number>, InvalidPoolOptionsError>>();
  });

  it('types collection pools correctly', () => {
    const arrPool = createArrayPool<string>();
    expectTypeOf(arrPool.acquire()).toEqualTypeOf<string[]>();

    const mapPool = createMapPool<string, number>();
    expectTypeOf(mapPool.acquire()).toEqualTypeOf<Map<string, number>>();
  });
});
