/**
 * Scoped RAII Execution and Resource Management for Pooled Items.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolScope
 */

import { DISPOSE_SYMBOL } from '../disposable';
import type { Result } from '../result';
import type { ScopedPooledItem } from './poolTypes';

export function runWithItem<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => R,
): R {
  const item = acquire();
  try {
    return fn(item);
  } finally {
    release(item);
  }
}

export function runWithItemResult<T, R, E>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => Result<R, E>,
): Result<R, E> {
  const item = acquire();
  try {
    return fn(item);
  } finally {
    release(item);
  }
}

export async function runWithItemAsync<T, R>(
  acquire: () => T,
  release: (item: T) => void,
  fn: (item: T) => Promise<R>,
): Promise<R> {
  const item = acquire();
  try {
    return await fn(item);
  } finally {
    release(item);
  }
}

export function createScopedItem<T>(
  acquire: () => T,
  release: (item: T) => void,
): ScopedPooledItem<T> {
  const item = acquire();
  let released = false;
  const doRelease = () => {
    if (!released) {
      released = true;
      release(item);
    }
  };
  return { value: item, release: doRelease, dispose: doRelease, [DISPOSE_SYMBOL]: doRelease };
}
