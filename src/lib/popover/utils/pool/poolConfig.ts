/**
 * Pool Configuration Parser, Options Normalizer, and Validator.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolConfig
 */

import type { ObjectPoolOptions } from './poolTypes';
import {
  type PoolCapacity,
  type PoolSize,
  type PoolTimeoutMs,
  toPoolCapacity,
  toPoolSize,
  toPoolTimeoutMs,
  DEFAULT_POOL_INITIAL,
  DEFAULT_POOL_MAX,
  DEFAULT_LEAK_TIMEOUT,
} from './poolBranded';
import {
  type InvalidPoolOptionsError,
  createInvalidPoolOptionsError,
} from './poolErrors';
import { Ok, Err, type Result } from '../result';

export interface ObjectPoolResolvedConfig<T> {
  readonly factory: () => T;
  readonly reset?: (item: T) => void;
  readonly onEvict?: (item: T) => void;
  readonly safeInitial: PoolSize;
  readonly safeMax: PoolCapacity;
  readonly idleDrainTimeoutMs?: PoolTimeoutMs;
  readonly enableLeakDetection: boolean;
  readonly leakTimeoutMs: PoolTimeoutMs;
}

export function resolvePoolOptions<T>(
  target: (() => T) | ObjectPoolOptions<T>,
  reset?: (item: T) => void,
  initialCapacity: number | PoolSize = DEFAULT_POOL_INITIAL,
  maxCapacity: number | PoolCapacity = DEFAULT_POOL_MAX,
): ObjectPoolResolvedConfig<T> {
  if (typeof target === 'object' && target !== null) {
    const safeMax = toPoolCapacity(target.maxCapacity ?? DEFAULT_POOL_MAX);
    const rawInit = target.initialCapacity ?? DEFAULT_POOL_INITIAL;
    const safeInitial = toPoolSize(Math.min(toPoolSize(rawInit), safeMax));
    const idleDrain = target.idleDrainTimeoutMs !== undefined
      ? toPoolTimeoutMs(target.idleDrainTimeoutMs)
      : undefined;

    return {
      factory: target.factory,
      reset: target.reset,
      onEvict: target.onEvict,
      safeInitial,
      safeMax,
      idleDrainTimeoutMs: idleDrain,
      enableLeakDetection: target.enableLeakDetection ?? false,
      leakTimeoutMs: toPoolTimeoutMs(target.leakTimeoutMs ?? DEFAULT_LEAK_TIMEOUT),
    };
  }

  const safeMax = toPoolCapacity(maxCapacity);
  const safeInitial = toPoolSize(Math.min(toPoolSize(initialCapacity), safeMax));
  return {
    factory: target,
    reset,
    safeInitial,
    safeMax,
    enableLeakDetection: false,
    leakTimeoutMs: DEFAULT_LEAK_TIMEOUT,
  };
}

function isObjectPoolOptions<T>(val: unknown): val is ObjectPoolOptions<T> {
  return typeof val === 'object' && val !== null && 'factory' in val && typeof val.factory === 'function';
}

export function validatePoolOptions<T>(
  options: unknown,
): Result<ObjectPoolResolvedConfig<T>, InvalidPoolOptionsError> {
  if (typeof options !== 'object' || options === null) {
    return Err(createInvalidPoolOptionsError('Options must be a non-null object', options));
  }
  if (!isObjectPoolOptions<T>(options)) {
    return Err(createInvalidPoolOptionsError('Factory function is required', options));
  }
  return Ok(resolvePoolOptions(options));
}
