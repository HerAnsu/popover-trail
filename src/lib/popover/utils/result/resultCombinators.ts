/**
 * Result Combinators (map, flatMap, unwrap, match, tap).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/result/resultCombinators
 */

import { Ok, Err, type Result } from './resultTypes';
import { toError } from '../guards/errorGuards';

/**
 * Transforms the inner value of an `OkResult` using a mapping function.
 * If the result is an `ErrResult`, returns it unchanged.
 *
 * @example
 * ```ts
 * const r = Ok(5);
 * const doubled = mapResult(r, (x) => x * 2); // Ok(10)
 * ```
 *
 * @param result - Input Result.
 * @param fn - Transformer applied to successful data.
 * @returns New Result with transformed value or original error.
 */
export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) return Ok(fn(result.data));
  return result;
}

/**
 * Chains a computation that returns another `Result`.
 * If the input is an `ErrResult`, returns it immediately without calling `fn`.
 *
 * @example
 * ```ts
 * const parse = (s: string) => s.length > 0 ? Ok(s.trim()) : Err('empty');
 * const res = flatMapResult(Ok('  hello  '), parse); // Ok('hello')
 * ```
 *
 * @param result - Input Result.
 * @param fn - Function returning a new Result.
 * @returns The Result returned by `fn` or original error.
 */
export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) return fn(result.data);
  return result;
}

/**
 * Functional alias for `flatMapResult`. Chains another Result computation.
 */
export const andThen = flatMapResult;

/**
 * Transforms the error of an `ErrResult` using a mapping function.
 * If the result is an `OkResult`, returns it unchanged.
 *
 * @example
 * ```ts
 * const r = Err('not_found');
 * const formatted = mapErr(r, (err) => ({ code: 404, message: err }));
 * ```
 *
 * @param result - Input Result.
 * @param fn - Transformer applied to the error payload.
 * @returns Result with transformed error or original data.
 */
export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) return Err(fn(result.error));
  return result;
}

/**
 * Extracts the inner value if `Ok`, or returns a fallback value if `Err`.
 *
 * @example
 * ```ts
 * const value = unwrapOr(Ok(42), 0); // 42
 * const fallback = unwrapOr(Err('fail'), 0); // 0
 * ```
 *
 * @param result - Input Result.
 * @param fallback - Default value returned on failure.
 * @returns Inner data or fallback.
 */
export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.success ? result.data : fallback;
}

/**
 * Extracts the inner value if `Ok`, or computes a fallback by calling `fallbackFn(error)` if `Err`.
 *
 * @example
 * ```ts
 * const value = unwrapOrElse(Err('404'), (err) => `Default for ${err}`);
 * ```
 *
 * @param result - Input Result.
 * @param fallbackFn - Function producing a fallback value from the error.
 * @returns Inner data or computed fallback.
 */
export function unwrapOrElse<T, E>(result: Result<T, E>, fallbackFn: (error: E) => T): T {
  return result.success ? result.data : fallbackFn(result.error);
}

/**
 * Extracts the inner value if `Ok`, or throws the error if `Err`.
 *
 * @remarks
 * If `result.error` is not an instance of `Error`, it is wrapped into a native `Error` before throwing.
 *
 * @example
 * ```ts
 * const data = unwrap(fetchResult); // throws Error if fetch failed
 * ```
 *
 * @param result - Input Result.
 * @returns Inner data.
 * @throws `Error` if result is an ErrResult.
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.data;
  throw toError(result.error);
}

/**
 * Pattern-matches against a Result, executing `patterns.ok` on success or `patterns.err` on failure.
 *
 * @example
 * ```ts
 * const message = matchResult(result, {
 *   ok: (user) => `Hello, ${user.name}!`,
 *   err: (error) => `Failed to load: ${error.message}`,
 * });
 * ```
 *
 * @param result - Input Result.
 * @param patterns - Object containing `ok` and `err` handlers.
 * @returns Output of the executed pattern handler.
 */
export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: { ok: (data: T) => R; err: (error: E) => R },
): R {
  return result.success ? patterns.ok(result.data) : patterns.err(result.error);
}

/**
 * Runs a side-effect callback if the Result is `Ok`, returning the original Result unchanged.
 *
 * @example
 * ```ts
 * const res = tapResult(saveResult, (data) => console.log('Saved:', data));
 * ```
 *
 * @param result - Input Result.
 * @param fn - Side-effect callback receiving success data.
 * @returns The original Result unchanged.
 */
export function tapResult<T, E>(result: Result<T, E>, fn: (data: T) => void): Result<T, E> {
  if (result.success) fn(result.data);
  return result;
}

/**
 * Runs a side-effect callback if the Result is `Err`, returning the original Result unchanged.
 *
 * @example
 * ```ts
 * const res = tapErr(loadResult, (err) => logger.warn('Load failed:', err));
 * ```
 *
 * @param result - Input Result.
 * @param fn - Side-effect callback receiving the error.
 * @returns The original Result unchanged.
 */
export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (!result.success) fn(result.error);
  return result;
}

/**
 * Safely executes a synchronous function, wrapping any thrown exception into an Err Result.
 *
 * @remarks
 * Eliminates unhandled try/catch blocks. If `onError` is provided, maps the caught unknown error
 * to a strongly typed domain error `E`. Otherwise falls back to a standardized `Error` instance.
 *
 * @template T - Successful return value type.
 * @template E - Mapped error type.
 * @param fn - Synchronous closure to execute safely.
 * @param onError - Optional transformer converting unknown exceptions into domain error `E`.
 * @returns Ok with the computed value, or Err with the captured error.
 *
 * @example
 * ```typescript
 * const res = fromThrowable(() => JSON.parse(rawText), (e) => new ParseError(String(e)));
 * ```
 */
export function fromThrowable<T>(fn: () => T): Result<T, Error>;
export function fromThrowable<T, E>(fn: () => T, onError: (err: unknown) => E): Result<T, E>;
export function fromThrowable<T, E>(
  fn: () => T,
  onError?: (err: unknown) => E,
): Result<T, E | Error> {
  try {
    return Ok(fn());
  } catch (err) {
    return Err(onError ? onError(err) : toError(err));
  }
}

/**
 * Safely awaits a Promise, converting any rejection into an `Err` result without throwing.
 *
 * @template T - Resolved value type.
 * @template E - Mapped error type.
 * @param promise - Promise to await.
 * @param onError - Optional function to map unknown rejection reasons into error `E`.
 * @returns Promise resolving to `Ok` on success or `Err` on failure.
 *
 * @example
 * ```typescript
 * const result = await fromPromise(fetch('/api/popovers'), (e) => new NetworkError(e));
 * ```
 */
export function fromPromise<T>(promise: Promise<T>): Promise<Result<T, Error>>;
export function fromPromise<T, E>(
  promise: Promise<T>,
  onError: (err: unknown) => E,
): Promise<Result<T, E>>;
export async function fromPromise<T, E>(
  promise: Promise<T>,
  onError?: (err: unknown) => E,
): Promise<Result<T, E | Error>> {
  try {
    const data = await promise;
    return Ok(data);
  } catch (err) {
    return Err(onError ? onError(err) : toError(err));
  }
}

/**
 * Combines an array of Results into a single Result containing an array of values.
 * If any Result is an `Err`, returns the first error encountered.
 *
 * @template T - Value type of successful results.
 * @template E - Error type of failed results.
 * @param results - Array of Results to evaluate.
 * @returns Ok with all values, or the first encountered Err.
 */
export function collectResults<T, E>(results: readonly Result<T, E>[]): Result<readonly T[], E> {
  const accumulated: T[] = [];
  for (const res of results) {
    if (!res.success) {
      return res;
    }
    accumulated.push(res.data);
  }
  return Ok(Object.freeze(accumulated));
}

/**
 * Partitions an array of Results into accumulated successes and accumulated errors.
 *
 * @remarks
 * Unlike `collectResults`, does not short-circuit. Accumulates all Ok values into `.ok`
 * and all Err values into `.err`, allowing partial failures to be inspected simultaneously.
 *
 * @template T - Value type.
 * @template E - Error type.
 * @param results - Array of Results to partition.
 * @returns An immutable object containing readonly arrays of all `ok` and `err` items.
 */
export function partitionResults<T, E>(
  results: readonly Result<T, E>[],
): { readonly ok: readonly T[]; readonly err: readonly E[] } {
  const ok: T[] = [];
  const err: E[] = [];
  for (const res of results) {
    if (res.success) {
      ok.push(res.data);
    } else {
      err.push(res.error);
    }
  }
  return Object.freeze({
    ok: Object.freeze(ok),
    err: Object.freeze(err),
  });
}

/**
 * Combines two independent Results into a single Result containing a 2-tuple.
 *
 * @remarks
 * Zips `r1` and `r2`. Fails with the first encountered Err if either computation failed.
 *
 * @template T1 - Type of the first result value.
 * @template T2 - Type of the second result value.
 * @template E - Error type.
 * @param r1 - First Result.
 * @param r2 - Second Result.
 * @returns Ok with a readonly 2-tuple `[T1, T2]`, or the first failing Err.
 */
export function combineResults<T1, T2, E>(
  r1: Result<T1, E>,
  r2: Result<T2, E>,
): Result<readonly [T1, T2], E> {
  if (!r1.success) return r1;
  if (!r2.success) return r2;
  return Ok(Object.freeze([r1.data, r2.data]));
}

/**
 * Asynchronously maps the Ok value of a Result using an async or sync transformer function.
 *
 * @template T - Input success type.
 * @template U - Output success type.
 * @template E - Error type.
 * @param result - Result or Promise resolving to a Result.
 * @param fn - Transformer returning U or Promise<U>.
 * @returns Promise resolving to the transformed Result.
 */
export async function mapAsyncResult<T, U, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: (data: T) => U | Promise<U>,
): Promise<Result<U, E>> {
  const resolved = await result;
  if (!resolved.success) return resolved;
  const mapped = await fn(resolved.data);
  return Ok(mapped);
}

/**
 * Monadic Kleisli composition over asynchronous Result transformations.
 *
 * @template T - Input success type.
 * @template U - Output success type.
 * @template E - Error type.
 * @param result - Result or Promise resolving to a Result.
 * @param fn - Asynchronous transformation returning a new Result.
 * @returns Promise resolving to the chained Result.
 */
export async function flatMapAsyncResult<T, U, E>(
  result: Result<T, E> | Promise<Result<T, E>>,
  fn: (data: T) => Result<U, E> | Promise<Result<U, E>>,
): Promise<Result<U, E>> {
  const resolved = await result;
  if (!resolved.success) return resolved;
  return await fn(resolved.data);
}
