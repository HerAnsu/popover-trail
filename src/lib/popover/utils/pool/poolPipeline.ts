/**
 * Zero-Allocation Iteration and Pipeline Mappers via Single-Instance Recycling.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolPipeline
 */

export interface PoolBorrower<T> {
  acquire: () => T;
  release: (item: T) => void;
  resetItem?: (item: T) => void;
}

export function mapWithItem<T, In, Out>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  fn: (pooled: T, input: In, index: number) => Out,
  out: Out[] = [],
): Out[] {
  const pooled = pool.acquire();
  try {
    let i = 0;
    for (const input of items) {
      if (i > 0 && pool.resetItem) pool.resetItem(pooled);
      out.push(fn(pooled, input, i++));
    }
    return out;
  } finally {
    pool.release(pooled);
  }
}

export function forEachWithItem<T, In>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  fn: (pooled: T, input: In, index: number) => void,
): void {
  const pooled = pool.acquire();
  try {
    let i = 0;
    for (const input of items) {
      if (i > 0 && pool.resetItem) pool.resetItem(pooled);
      fn(pooled, input, i++);
    }
  } finally {
    pool.release(pooled);
  }
}

export function reduceWithItem<T, In, Acc>(
  pool: PoolBorrower<T>,
  items: Iterable<In>,
  initial: Acc,
  fn: (acc: Acc, pooled: T, input: In, index: number) => Acc,
): Acc {
  const pooled = pool.acquire();
  try {
    let acc = initial;
    let i = 0;
    for (const input of items) {
      if (i > 0 && pool.resetItem) pool.resetItem(pooled);
      acc = fn(acc, pooled, input, i++);
    }
    return acc;
  } finally {
    pool.release(pooled);
  }
}
