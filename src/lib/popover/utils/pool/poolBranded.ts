/**
 * Nominal Branded Types for Object Pool Dimensions and Timeouts.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/pool/poolBranded
 */

import { type Brand, createBrand } from '../../types/branded';

export type PoolCapacity = Brand<number, 'PoolCapacity'>;
export type PoolSize = Brand<number, 'PoolSize'>;
export type PoolTimeoutMs = Brand<number, 'PoolTimeoutMs'>;

export const DEFAULT_POOL_INITIAL = createBrand<number, 'PoolSize'>(32);
export const DEFAULT_POOL_MAX = createBrand<number, 'PoolCapacity'>(256);
export const DEFAULT_LEAK_TIMEOUT = createBrand<number, 'PoolTimeoutMs'>(10000);

/**
 * Smart constructor for PoolCapacity.
 * Validates and clamps capacity to a positive integer (minimum 1).
 *
 * @param cap - Raw capacity number.
 * @returns Validated and clamped PoolCapacity.
 */
export function toPoolCapacity(cap: number): PoolCapacity {
  const safe = Number.isFinite(cap) && cap >= 1 ? Math.trunc(cap) : 1;
  return createBrand<number, 'PoolCapacity'>(safe);
}

/**
 * Smart constructor for PoolSize.
 * Validates and clamps size to a non-negative integer (minimum 0).
 *
 * @param size - Raw pool size number.
 * @returns Validated and clamped PoolSize.
 */
export function toPoolSize(size: number): PoolSize {
  const safe = Number.isFinite(size) && size >= 0 ? Math.trunc(size) : 0;
  return createBrand<number, 'PoolSize'>(safe);
}

/**
 * Smart constructor for PoolTimeoutMs.
 * Validates and clamps timeout duration in milliseconds (minimum 0).
 *
 * @param ms - Raw timeout duration in milliseconds.
 * @returns Validated and clamped PoolTimeoutMs.
 */
export function toPoolTimeoutMs(ms: number): PoolTimeoutMs {
  const safe = Number.isFinite(ms) && ms >= 0 ? Math.trunc(ms) : 0;
  return createBrand<number, 'PoolTimeoutMs'>(safe);
}

/**
 * Type guard verifying if an unknown value satisfies PoolCapacity invariants.
 */
export function isPoolCapacity(val: unknown): val is PoolCapacity {
  return typeof val === 'number' && Number.isInteger(val) && val >= 1;
}

/**
 * Type guard verifying if an unknown value satisfies PoolSize invariants.
 */
export function isPoolSize(val: unknown): val is PoolSize {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

/**
 * Type guard verifying if an unknown value satisfies PoolTimeoutMs invariants.
 */
export function isPoolTimeoutMs(val: unknown): val is PoolTimeoutMs {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}
