/**
 * Zero-Leak Bounded Memoization Utilities.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/memoize
 */

import { shallowEqualArray } from './equality';

/**
 * Result function returned by `memoizeOne` augmented with an explicit `.clear()` method.
 */
export type MemoizedFn<Args extends readonly unknown[], R> = ((...args: Args) => R) & {
  clear(): void;
};

/**
 * Memoizes the last result of a function with bounded capacity 1.
 * Prevents heap accumulation and GC pauses by retaining at most one snapshot.
 *
 * @template Args - Arguments tuple.
 * @template R - Return value type.
 * @param fn - Pure computation function to memoize.
 * @param isEqual - Custom arguments equality comparator (defaults to `shallowEqualArray`).
 * @returns Memoized function with `.clear()` invalidation handle.
 *
 * @example
 * ```typescript
 * const computeBoundingBox = memoizeOne((x: number, y: number, w: number, h: number) => ({
 *   left: x,
 *   top: y,
 *   right: x + w,
 *   bottom: y + h,
 * }));
 * const box = computeBoundingBox(10, 20, 100, 50);
 * computeBoundingBox.clear();
 * ```
 */
export function memoizeOne<Args extends readonly unknown[], R>(
  fn: (...args: Args) => R,
  isEqual: (newArgs: Args, lastArgs: Args) => boolean = shallowEqualArray,
): MemoizedFn<Args, R> {
  let lastArgs: Args | null = null;
  let lastResult: R | undefined;
  let hasResult = false;

  const memoized = ((...args: Args): R => {
    if (hasResult && lastArgs !== null && isEqual(args, lastArgs)) {
      return lastResult as R;
    }

    lastResult = fn(...args);
    lastArgs = args;
    hasResult = true;
    return lastResult;
  }) as MemoizedFn<Args, R>;

  memoized.clear = () => {
    lastArgs = null;
    lastResult = undefined;
    hasResult = false;
  };

  return memoized;
}

/**
 * Memoizes a single-argument object function using WeakMap.
 * Guarantees zero memory retention: cache entries are automatically garbage collected
 * when the key object is unreachable.
 *
 * @template K - Object key type.
 * @template R - Result type.
 * @param fn - Transformer function mapping object key to result.
 * @returns Weak memoized function with `.delete()` entry removal handle.
 *
 * @example
 * ```typescript
 * const getElementLayout = memoizeWeak((el: HTMLElement) => ({
 *   width: el.offsetWidth,
 *   height: el.offsetHeight,
 * }));
 * const layout = getElementLayout(cardRef);
 * ```
 */
export function memoizeWeak<K extends object, R>(
  fn: (key: K) => R,
): ((key: K) => R) & { delete(key: K): boolean } {
  const cache = new WeakMap<K, R>();

  const memoized = (key: K): R => {
    const existing = cache.get(key);
    if (existing !== undefined || cache.has(key)) {
      return existing as R;
    }

    const result = fn(key);
    cache.set(key, result);
    return result;
  };

  memoized.delete = (key: K): boolean => {
    return cache.delete(key);
  };

  return memoized;
}
