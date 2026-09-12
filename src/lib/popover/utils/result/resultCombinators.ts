/**
 * Result Monadic Combinators (map, flatMap, unwrap, match, tap).
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/result/resultCombinators
 */

import { Ok, Err, type Result } from './resultTypes';
import { toError } from '../guards/errorGuards';

export function mapResult<T, U, E>(result: Result<T, E>, fn: (data: T) => U): Result<U, E> {
  if (result.success) return Ok(fn(result.data));
  return result;
}

export function flatMapResult<T, U, E>(
  result: Result<T, E>,
  fn: (data: T) => Result<U, E>,
): Result<U, E> {
  if (result.success) return fn(result.data);
  return result;
}

export const andThen = flatMapResult;

export function mapErr<T, E, F>(result: Result<T, E>, fn: (error: E) => F): Result<T, F> {
  if (!result.success) return Err(fn(result.error));
  return result;
}

export function unwrapOr<T, E>(result: Result<T, E>, fallback: T): T {
  return result.success ? result.data : fallback;
}

export function unwrapOrElse<T, E>(result: Result<T, E>, fallbackFn: (error: E) => T): T {
  return result.success ? result.data : fallbackFn(result.error);
}

export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.success) return result.data;
  throw toError(result.error);
}

export function matchResult<T, E, R>(
  result: Result<T, E>,
  patterns: { ok: (data: T) => R; err: (error: E) => R },
): R {
  return result.success ? patterns.ok(result.data) : patterns.err(result.error);
}

export function tapResult<T, E>(result: Result<T, E>, fn: (data: T) => void): Result<T, E> {
  if (result.success) fn(result.data);
  return result;
}

export function tapErr<T, E>(result: Result<T, E>, fn: (error: E) => void): Result<T, E> {
  if (!result.success) fn(result.error);
  return result;
}
