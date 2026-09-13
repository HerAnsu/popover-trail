/**
 * Pure Functional Programming Combinators (Pipe, Compose, Identity, Noop).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/functional
 */

/**
 * The identity function. Returns the exact passed argument without modification.
 *
 * @template T - Argument type.
 * @param value - Value to return.
 * @returns The exact value.
 */
export function identity<T>(value: T): T {
  return value;
}

/**
 * Pure singleton no-op callback.
 */
export function noop(): void {}

/**
 * Returns a constant function that always produces `val`.
 *
 * @template T - Return value type.
 * @param val - The constant value.
 * @returns Function returning `val`.
 */
export function constant<T>(val: T): () => T {
  return () => val;
}

/**
 * Performs left-to-right function composition (pipeline).
 *
 * @template A - Initial value type.
 * @param a - Initial value.
 * @returns Final composed result.
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
 * @returns Composed function.
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
