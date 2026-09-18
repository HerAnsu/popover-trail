/**
 * Scoped RAII Execution and Resource Management for Pooled Items.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolScope
 */

import { DISPOSE_SYMBOL } from '../disposable';
import type { Result } from '../result';
import type { ScopedPooledItem, Pooled } from './poolTypes';

/**
 * Executes a function with a borrowed pooled item and guarantees its release via `finally`.
 *
 * @template T - Type of pooled resource.
 * @template R - Return value type of callback function.
 * @param acquire - Factory callback to borrow the item.
 * @param release - Teardown callback to return the item.
 * @param fn - Work callback receiving the borrowed item.
 * @returns The return value of `fn`.
 *
 * @example
 * ```typescript
 * const len = runWithItem(
 *   () => pool.acquire(),
 *   (item) => pool.release(item),
 *   (arr) => {
 *     arr.push('a', 'b');
 *     return arr.length;
 *   },
 * );
 * ```
 */
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

/**
 * Executes a function returning a `Result` with a borrowed pooled item, guaranteeing its release.
 *
 * @template T - Type of pooled resource.
 * @template R - Ok result type.
 * @template E - Err domain error type.
 * @param acquire - Factory callback to borrow the item.
 * @param release - Teardown callback to return the item.
 * @param fn - Work callback returning a `Result`.
 * @returns The `Result<R, E>` produced by `fn`.
 *
 * @example
 * ```typescript
 * const res = runWithItemResult(
 *   () => pool.acquire(),
 *   (item) => pool.release(item),
 *   (buffer) => processBufferResult(buffer),
 * );
 * ```
 */
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

/**
 * Asynchronously executes a function with a borrowed pooled item and guarantees its release.
 *
 * @template T - Type of pooled resource.
 * @template R - Return value type of async callback.
 * @param acquire - Factory callback to borrow the item.
 * @param release - Teardown callback to return the item.
 * @param fn - Async work callback receiving the borrowed item.
 * @returns Promise resolving to the return value of `fn`.
 *
 * @example
 * ```typescript
 * const count = await runWithItemAsync(
 *   () => pool.acquire(),
 *   (item) => pool.release(item),
 *   async (buffer) => {
 *     await fillBuffer(buffer);
 *     return buffer.byteLength;
 *   },
 * );
 * ```
 */
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

/**
 * Creates an explicit resource management wrapper around a pooled item compatible with `using` / `Symbol.dispose`.
 *
 * @template T - Type of pooled resource.
 * @param acquire - Factory callback to borrow the item.
 * @param release - Teardown callback to return the item.
 * @returns A `ScopedPooledItem<T>` with idempotent disposal.
 *
 * @example
 * ```typescript
 * {
 *   using scoped = createScopedItem(() => pool.acquire(), (i) => pool.release(i));
 *   scoped.value.x = 100;
 * } // automatically released at scope exit
 * ```
 */
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

/**
 * Augments an object or tuple array with modern synchronous RAII disposal contracts.
 * Compatible with the native ECMAScript / TypeScript `using` keyword.
 *
 * @template T - Target object type.
 * @param target - The object or tuple to augment.
 * @param onDispose - Cleanup routine invoked upon disposal.
 * @returns The target augmented with `[DISPOSE_SYMBOL]`, `dispose()`, and `isDisposed`.
 */
export function attachDisposableHandle<T extends object>(
  target: T,
  onDispose: () => void,
): Pooled<T> {
  let released = false;
  const dispose = () => {
    if (released) return;
    released = true;
    onDispose();
  };

  Object.defineProperty(target, DISPOSE_SYMBOL, {
    value: dispose,
    configurable: true,
    writable: true,
  });
  if (typeof Symbol.dispose === 'symbol' && (DISPOSE_SYMBOL as symbol) !== Symbol.dispose) {
    Object.defineProperty(target, Symbol.dispose, {
      value: dispose,
      configurable: true,
      writable: true,
    });
  }
  Object.defineProperty(target, 'dispose', {
    value: dispose,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(target, 'isDisposed', {
    get: () => released,
    configurable: true,
  });

  return target as Pooled<T>;
}
