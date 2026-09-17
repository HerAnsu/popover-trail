/**
 * Pure Functional Programming Combinators (Pipe, Compose, Identity, Noop).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/functional
 */

/** The identity function. Returns the passed argument without modification. */
export function identity<T>(value: T): T {
  return value;
}

/** Pure singleton no-op callback. */
export function noop(): void {}

/** Returns a constant function that always produces `val`. */
export function constant<T>(val: T): () => T {
  return () => val;
}

/**
 * Performs left-to-right function composition (pipeline).
 *
 * @template A - Initial value type.
 * @param a - Initial value.
 * @returns Final composed result.
 *
 * @example
 * ```typescript
 * const format = pipe(
 *   '  hello  ',
 *   (s) => s.trim(),
 *   (s) => s.toUpperCase(),
 * ); // => 'HELLO'
 * ```
 */
export function pipe<A>(a: A): A;
export function pipe<A, B>(a: A, ab: (a: A) => B): B;
export function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C;
export function pipe<A, B, C, D>(a: A, ab: (a: A) => B, bc: (b: B) => C, cd: (c: C) => D): D;
export function pipe<A, B, C, D, E>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
): E;
export function pipe<A, B, C, D, E, F>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
): F;
export function pipe<A, B, C, D, E, F, G>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D,
  de: (d: D) => E,
  ef: (e: E) => F,
  fg: (f: F) => G,
): G;
export function pipe<T = unknown>(value: T, ...fns: readonly ((arg: T) => T)[]): T;
export function pipe(value: unknown, ...fns: readonly ((arg: unknown) => unknown)[]): unknown {
  let acc = value;
  for (const fn of fns) {
    if (typeof fn === 'function') {
      acc = fn(acc);
    }
  }
  return acc;
}

/**
 * Performs right-to-left function composition.
 *
 * @returns Composed function executing right-to-left.
 *
 * @example
 * ```typescript
 * const roundAndDouble = compose(
 *   (n: number) => n * 2,
 *   (n: number) => Math.round(n),
 * );
 * roundAndDouble(4.6); // => 10
 * ```
 */
export function compose<A, B>(ab: (a: A) => B): (a: A) => B;
export function compose<A, B, C>(bc: (b: B) => C, ab: (a: A) => B): (a: A) => C;
export function compose<A, B, C, D>(
  cd: (c: C) => D,
  bc: (b: B) => C,
  ab: (a: A) => B,
): (a: A) => D;
export function compose<A, B, C, D, E>(
  de: (d: D) => E,
  cd: (c: C) => D,
  bc: (b: B) => C,
  ab: (a: A) => B,
): (a: A) => E;
export function compose<T = unknown>(...fns: readonly ((arg: T) => T)[]): (initial: T) => T;
export function compose(
  ...fns: readonly ((arg: unknown) => unknown)[]
): (initial: unknown) => unknown {
  return (initial: unknown) => {
    let acc = initial;
    for (let i = fns.length - 1; i >= 0; i--) {
      const fn = fns[i];
      if (typeof fn === 'function') {
        acc = fn(acc);
      }
    }
    return acc;
  };
}

/** Curries a binary function into a sequence of two unary functions. */
export function curry2<A, B, R>(fn: (a: A, b: B) => R): (a: A) => (b: B) => R {
  return (a: A) => (b: B) => fn(a, b);
}

/** Creates an accessor function extracting the specified property from an object. */
export function prop<T, K extends keyof T>(key: K): (obj: T) => T[K] {
  return (obj: T) => obj[key];
}

/** Creates a predicate checking if an object's property strictly equals the specified value. */
export function propEq<T, K extends keyof T>(key: K, value: T[K]): (obj: T) => boolean {
  return (obj: T) => obj[key] === value;
}

/**
 * Combines multiple predicates into a single conjunction predicate (logical AND).
 * Short-circuits with zero heap allocations on hot path.
 *
 * @template T - Target value type.
 * @param predicates - Readonly array of predicate functions.
 * @returns Conjunction predicate function.
 *
 * @example
 * ```typescript
 * const isPositiveEven = and(
 *   (n: number) => n > 0,
 *   (n: number) => n % 2 === 0,
 * );
 * isPositiveEven(4); // => true
 * isPositiveEven(-2); // => false
 * ```
 */
export function and<T>(...predicates: readonly ((val: T) => boolean)[]): (val: T) => boolean {
  return (val: T) => {
    for (const pred of predicates) {
      if (!pred(val)) return false;
    }
    return true;
  };
}

/**
 * Combines multiple predicates into a single disjunction predicate (logical OR).
 * Short-circuits with zero heap allocations on hot path.
 *
 * @template T - Target value type.
 * @param predicates - Readonly array of predicate functions.
 * @returns Disjunction predicate function.
 *
 * @example
 * ```typescript
 * const isZeroOrNegative = or(
 *   (n: number) => n === 0,
 *   (n: number) => n < 0,
 * );
 * isZeroOrNegative(0); // => true
 * isZeroOrNegative(5); // => false
 * ```
 */
export function or<T>(...predicates: readonly ((val: T) => boolean)[]): (val: T) => boolean {
  return (val: T) => {
    for (const pred of predicates) {
      if (pred(val)) return true;
    }
    return false;
  };
}

/** Inverts a predicate function (logical NOT). */
export function not<T>(predicate: (val: T) => boolean): (val: T) => boolean {
  return (val: T) => !predicate(val);
}

