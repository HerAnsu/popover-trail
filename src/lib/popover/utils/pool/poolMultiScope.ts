/**
 * Multi-Item Scoped RAII Execution for High-Frequency Geometry Pairs and Triples.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolMultiScope
 */

export function runWithPair<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T) => R,
): R {
  const a = acquire();
  const b = acquire();
  try {
    return fn(a, b);
  } finally {
    release(b);
    release(a);
  }
}

export function runWithTriple<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T, c: T) => R,
): R {
  const a = acquire();
  const b = acquire();
  const c = acquire();
  try {
    return fn(a, b, c);
  } finally {
    release(c);
    release(b);
    release(a);
  }
}

export async function runWithPairAsync<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (a: T, b: T) => Promise<R>,
): Promise<R> {
  const a = acquire();
  const b = acquire();
  try {
    return await fn(a, b);
  } finally {
    release(b);
    release(a);
  }
}

export function runWithMany<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  count: number,
  fn: (items: readonly T[]) => R,
): R {
  const items: T[] = [];
  const target = Math.max(0, count);
  try {
    for (let i = 0; i < target; i++) items.push(acquire());
    return fn(items);
  } finally {
    for (let i = items.length - 1; i >= 0; i--) {
      const item = items[i];
      if (item !== undefined) release(item);
    }
  }
}

