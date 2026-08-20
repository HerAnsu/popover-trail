/**
 * Smart Constructors and Runtime Invariant Validation for Nominal Branded Types.
 * Guarantees that branded types satisfy domain invariants before entering the system.
 *
 * @module utils/branded
 */

import type {
  PopoverKey,
  ParentKey,
  OwnerId,
  StackGroupId,
  DurationMs,
  TimestampMs,
  ZIndexDepth,
} from '../types/branded';

/**
 * Smart constructor for `PopoverKey`.
 * Validates that the input is a non-empty trimmed string.
 *
 * @template K - String literal or union type.
 * @param key - Raw key string to brand.
 * @returns Strongly typed PopoverKey.
 * @throws {TypeError} If key is empty or not a string.
 */
export function toPopoverKey<K extends string = string>(key: K): PopoverKey<K> {
  if (key.trim().length === 0) {
    throw new TypeError('[popover-trail]: PopoverKey must be a non-empty string.');
  }
  return key as PopoverKey<K>;
}

/**
 * Smart constructor for `ParentKey`.
 *
 * @template K - String literal or union type.
 * @param key - Raw parent key string to brand.
 * @returns Strongly typed ParentKey.
 */
export function toParentKey<K extends string = string>(key: K): ParentKey<K> {
  return key as ParentKey<K>;
}

/**
 * Smart constructor for `OwnerId`.
 *
 * @template O - String literal or union type.
 * @param ownerId - Raw owner ID string to brand.
 * @returns Strongly typed OwnerId.
 */
export function toOwnerId<O extends string = string>(ownerId: O): OwnerId<O> {
  return ownerId as OwnerId<O>;
}

/**
 * Smart constructor for `StackGroupId`.
 *
 * @template G - String literal or union type.
 * @param groupId - Raw group ID string to brand.
 * @returns Strongly typed StackGroupId.
 */
export function toStackGroupId<G extends string = string>(groupId: G): StackGroupId<G> {
  return groupId as StackGroupId<G>;
}

/**
 * Smart constructor for `DurationMs`.
 * Validates that the duration is a finite, non-negative number.
 *
 * @param ms - Raw duration in milliseconds.
 * @returns Validated DurationMs brand.
 */
export function toDurationMs(ms: number): DurationMs {
  const safe = Number.isFinite(ms) && ms >= 0 ? ms : 0;
  return safe as DurationMs;
}

/**
 * Smart constructor for `TimestampMs`.
 * Validates that the timestamp is a finite number (defaults to Date.now()).
 *
 * @param ts - Optional raw timestamp in milliseconds.
 * @returns Validated TimestampMs brand.
 */
export function toTimestampMs(ts?: number): TimestampMs {
  const safe = typeof ts === 'number' && Number.isFinite(ts) ? ts : Date.now();
  return safe as TimestampMs;
}

/**
 * Smart constructor for `ZIndexDepth`.
 * Validates that the z-index depth is a non-negative integer.
 *
 * @param depth - Raw depth number.
 * @returns Validated ZIndexDepth brand.
 */
export function toZIndexDepth(depth: number): ZIndexDepth {
  const safe = Number.isFinite(depth) && depth >= 0 ? Math.floor(depth) : 0;
  return safe as ZIndexDepth;
}

/**
 * Type guard predicate checking if a value is a valid non-empty PopoverKey.
 *
 * @param value - Value to test.
 * @returns True if value is a valid PopoverKey string.
 */
export function isPopoverKey(value: unknown): value is PopoverKey {
  return typeof value === 'string' && value.trim().length > 0;
}
