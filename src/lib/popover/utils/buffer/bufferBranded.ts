/**
 * Nominal Branded Types for Bounded Ring Buffer Indices and Revisions.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/buffer/bufferBranded
 */

import { type Brand, createBrand } from '../../types/branded';

export type BufferLogicalIndex = Brand<number, 'BufferLogicalIndex'>;
export type BufferPhysicalIndex = Brand<number, 'BufferPhysicalIndex'>;
export type BufferRevision = Brand<number, 'BufferRevision'>;
export type BufferCapacity = Brand<number, 'BufferCapacity'>;
export type BufferRelativeIndex = BufferLogicalIndex | number;

export const ZERO_LOGICAL_INDEX = createBrand<number, 'BufferLogicalIndex'>(0);
export const ZERO_PHYSICAL_INDEX = createBrand<number, 'BufferPhysicalIndex'>(0);
export const INITIAL_REVISION = createBrand<number, 'BufferRevision'>(0);
export const DEFAULT_BUFFER_CAPACITY = createBrand<number, 'BufferCapacity'>(16);

/**
 * Converts a raw number to a validated, truncated logical index.
 */
export function toLogicalIndex(idx: number): BufferLogicalIndex {
  return createBrand<number, 'BufferLogicalIndex'>(Math.trunc(idx));
}

/**
 * Converts a raw number to a validated, truncated physical index.
 */
export function toPhysicalIndex(idx: number): BufferPhysicalIndex {
  return createBrand<number, 'BufferPhysicalIndex'>(Math.trunc(idx));
}

/**
 * Converts a raw number to a non-negative integer buffer revision.
 */
export function toBufferRevision(rev: number): BufferRevision {
  return createBrand<number, 'BufferRevision'>(Math.max(0, Math.trunc(rev)));
}

/**
 * Converts a raw number to a positive buffer capacity (minimum 1).
 */
export function toBufferCapacity(cap: number): BufferCapacity {
  return createBrand<number, 'BufferCapacity'>(Math.max(1, Math.trunc(cap)));
}

/**
 * Increments the revision counter with 32-bit unsigned overflow wrap-around.
 */
export function nextRevision(rev: BufferRevision): BufferRevision {
  return createBrand<number, 'BufferRevision'>((rev + 1) >>> 0);
}

/**
 * Validates if an unknown value satisfies the BufferLogicalIndex invariants.
 */
export function isLogicalIndex(val: unknown): val is BufferLogicalIndex {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

/**
 * Validates if an unknown value satisfies the BufferPhysicalIndex invariants.
 */
export function isPhysicalIndex(val: unknown): val is BufferPhysicalIndex {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

/**
 * Validates if an unknown value satisfies the BufferRevision invariants.
 */
export function isBufferRevision(val: unknown): val is BufferRevision {
  return typeof val === 'number' && Number.isInteger(val) && val >= 0;
}

/**
 * Validates if an unknown value satisfies the BufferCapacity invariants.
 */
export function isBufferCapacity(val: unknown): val is BufferCapacity {
  return typeof val === 'number' && Number.isInteger(val) && val > 0;
}
