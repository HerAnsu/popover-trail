/**
 * Smart Constructors and Runtime Invariant Validation for Branded Numbers.
 *
 * @module utils/brandedNumbers
 */

import {
  type DurationMs,
  type TimestampMs,
  type ViewportX,
  type ViewportY,
  type ZIndexDepth,
  type WorkerTaskId,
  type CausalSequence,
  type HistoryCapacity,
  type Unbrand,
  createBrand,
} from '../types/branded';

/**
 * Smart constructor for `DurationMs`.
 * Validates that the duration is a finite, non-negative number. Accepts branded and unbranded numbers.
 *
 * @param ms - Raw or branded duration in milliseconds.
 * @returns Validated DurationMs brand.
 */
export function toDurationMs(ms: DurationMs | Unbrand<DurationMs>): DurationMs {
  const safe = Number.isFinite(ms) && ms >= 0 ? ms : 0;
  return createBrand<number, 'DurationMs'>(safe);
}

/**
 * Smart constructor for `TimestampMs`.
 * Validates that the timestamp is a finite number (defaults to Date.now()). Accepts branded and unbranded timestamps.
 *
 * @param ts - Optional raw or branded timestamp in milliseconds.
 * @returns Validated TimestampMs brand.
 */
export function toTimestampMs(ts?: TimestampMs | Unbrand<TimestampMs>): TimestampMs {
  const safe = typeof ts === 'number' && Number.isFinite(ts) ? ts : Date.now();
  return createBrand<number, 'TimestampMs'>(safe);
}

/**
 * Smart constructor for `ZIndexDepth`.
 * Validates that the z-index depth is a non-negative integer. Accepts branded and unbranded depths.
 *
 * @param depth - Raw or branded depth number.
 * @returns Validated ZIndexDepth brand.
 */
export function toZIndexDepth(depth: ZIndexDepth | Unbrand<ZIndexDepth>): ZIndexDepth {
  const safe = Number.isFinite(depth) && depth >= 0 ? Math.floor(depth) : 0;
  return createBrand<number, 'ZIndexDepth'>(safe);
}

/**
 * Smart constructor for `ViewportX`.
 * Validates that the x-coordinate is a finite number, sanitizing non-finite values to 0.
 *
 * @param x - Raw or branded horizontal viewport coordinate.
 * @returns Validated ViewportX brand.
 */
export function toViewportX(x: ViewportX | Unbrand<ViewportX>): ViewportX {
  const safe = Number.isFinite(x) ? x : 0;
  return createBrand<number, 'ViewportX'>(safe);
}

/**
 * Smart constructor for `ViewportY`.
 * Validates that the y-coordinate is a finite number, sanitizing non-finite values to 0.
 *
 * @param y - Raw or branded vertical viewport coordinate.
 * @returns Validated ViewportY brand.
 */
export function toViewportY(y: ViewportY | Unbrand<ViewportY>): ViewportY {
  const safe = Number.isFinite(y) ? y : 0;
  return createBrand<number, 'ViewportY'>(safe);
}

/**
 * Smart constructor for `WorkerTaskId`.
 * Validates that the task id is a positive safe integer. Accepts branded and unbranded IDs.
 *
 * @param id - Raw or branded numeric task identifier.
 * @returns Validated WorkerTaskId brand (defaults to 1 if non-positive or non-integer).
 */
export function toWorkerTaskId(id: WorkerTaskId | Unbrand<WorkerTaskId>): WorkerTaskId {
  const safe = Number.isSafeInteger(id) && id > 0 ? id : 1;
  return createBrand<number, 'WorkerTaskId'>(safe);
}

/**
 * Type guard checking if a value is a valid WorkerTaskId.
 *
 * @param value - Unknown input to check.
 * @returns True if value is a positive safe integer.
 */
export function isWorkerTaskId(value: unknown): value is WorkerTaskId {
  return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

/**
 * Smart constructor for `CausalSequence`.
 * Validates that the logical sequence counter is a non-negative safe integer. Accepts branded and unbranded counters.
 *
 * @param seq - Raw or branded numeric sequence counter.
 * @returns Validated CausalSequence brand (defaults to 0 if negative or non-integer).
 */
export function toCausalSequence(seq: CausalSequence | Unbrand<CausalSequence>): CausalSequence {
  const safe = Number.isSafeInteger(seq) && seq >= 0 ? seq : 0;
  return createBrand<number, 'CausalSequence'>(safe);
}

/**
 * Type guard checking if a value is a valid CausalSequence.
 *
 * @param value - Unknown input to check.
 * @returns True if value is a non-negative safe integer.
 */
export function isCausalSequence(value: unknown): value is CausalSequence {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/**
 * Smart constructor for `HistoryCapacity`.
 * Validates that history capacity is a positive safe integer >= 1 (defaults to 30). Accepts branded and unbranded capacity.
 *
 * @param capacity - Raw or branded capacity integer.
 * @returns Validated HistoryCapacity brand.
 */
export function toHistoryCapacity(
  capacity: HistoryCapacity | Unbrand<HistoryCapacity>,
): HistoryCapacity {
  const safe = Number.isSafeInteger(capacity) && capacity >= 1 ? capacity : 30;
  return createBrand<number, 'HistoryCapacity'>(safe);
}

/**
 * Type guard checking if a value is a valid HistoryCapacity.
 *
 * @param value - Unknown input to check.
 * @returns True if value is a safe integer >= 1.
 */
export function isHistoryCapacity(value: unknown): value is HistoryCapacity {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}
