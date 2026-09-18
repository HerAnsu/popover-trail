/**
 * Domain Error Model, Type Guards, and Factory Helpers for Object Pools.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolErrors
 */

import { assertNever } from '../assertNever';

export interface InvalidPoolOptionsError {
  readonly code: 'INVALID_POOL_OPTIONS';
  readonly message: string;
  readonly options?: unknown;
}

export interface PoolExhaustedError {
  readonly code: 'POOL_EXHAUSTED';
  readonly message: string;
  readonly capacity: number;
}

export interface PoolDisposedError {
  readonly code: 'POOL_DISPOSED';
  readonly message: string;
}

export type PoolDomainError = InvalidPoolOptionsError | PoolExhaustedError | PoolDisposedError;

export type PoolDomainErrorCode = PoolDomainError['code'];

export function isPoolDomainError(val: unknown): val is PoolDomainError {
  if (typeof val !== 'object' || val === null || !('code' in val)) return false;
  const c = val.code;
  return c === 'INVALID_POOL_OPTIONS' || c === 'POOL_EXHAUSTED' || c === 'POOL_DISPOSED';
}

export function isInvalidPoolOptionsError(val: unknown): val is InvalidPoolOptionsError {
  return (
    typeof val === 'object' && val !== null && 'code' in val && val.code === 'INVALID_POOL_OPTIONS'
  );
}

export function isPoolExhaustedError(val: unknown): val is PoolExhaustedError {
  return typeof val === 'object' && val !== null && 'code' in val && val.code === 'POOL_EXHAUSTED';
}

export function isPoolDisposedError(val: unknown): val is PoolDisposedError {
  return typeof val === 'object' && val !== null && 'code' in val && val.code === 'POOL_DISPOSED';
}

export function matchPoolError<R>(
  err: PoolDomainError,
  cases: {
    INVALID_POOL_OPTIONS: (e: InvalidPoolOptionsError) => R;
    POOL_EXHAUSTED: (e: PoolExhaustedError) => R;
    POOL_DISPOSED: (e: PoolDisposedError) => R;
  },
): R {
  switch (err.code) {
    case 'INVALID_POOL_OPTIONS':
      return cases.INVALID_POOL_OPTIONS(err);
    case 'POOL_EXHAUSTED':
      return cases.POOL_EXHAUSTED(err);
    case 'POOL_DISPOSED':
      return cases.POOL_DISPOSED(err);
    default:
      return assertNever(err);
  }
}

export function createInvalidPoolOptionsError(
  msg: string,
  options?: unknown,
): InvalidPoolOptionsError {
  return { code: 'INVALID_POOL_OPTIONS', message: msg, options };
}

export function createPoolExhaustedError(cap: number, msg?: string): PoolExhaustedError {
  return {
    code: 'POOL_EXHAUSTED',
    message: msg ?? `Object pool capacity (${cap}) exhausted`,
    capacity: cap,
  };
}

export function createPoolDisposedError(msg?: string): PoolDisposedError {
  return { code: 'POOL_DISPOSED', message: msg ?? 'Operation invalid on disposed ObjectPool' };
}
