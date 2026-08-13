/**
 * Design by Contract Assertion Precondition Guards for popover-trail.
 * Provides fail-fast validation with automatic TypeScript type narrowing.
 *
 * @module assertions
 */

import { PopoverError, PopoverErrorCode } from './errors';
import type { PopoverKey, OwnerId } from '../types/storeTypes';

/**
 * Asserts that a value is non-nullable (not null or undefined).
 *
 * @param value - Value to assert.
 * @param name - Property or argument variable name for diagnostic messages.
 */
export function assertNonNullable<T>(value: T, name = 'value'): asserts value is NonNullable<T> {
  if (value === null || value === undefined) {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      `Precondition assertion failed: ${name} cannot be null or undefined.`,
      `Ensure ${name} is properly initialized before passing to this function.`,
    );
  }
}

/**
 * Asserts that a key string is a valid non-empty PopoverKey.
 *
 * @param key - Value to check.
 */
export function assertValidPopoverKey(key: unknown): asserts key is PopoverKey {
  if (typeof key !== 'string' || key.trim() === '') {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      `Precondition assertion failed: PopoverKey must be a non-empty string.`,
      'Provide a non-empty string identifier (e.g. "card-1" or "user:profile").',
    );
  }
}

/**
 * Asserts that a value is a valid non-empty OwnerId.
 *
 * @param ownerId - Owner ID to check.
 */
export function assertValidOwnerId(ownerId: unknown): asserts ownerId is OwnerId {
  if (typeof ownerId !== 'string' || ownerId.trim() === '') {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      `Precondition assertion failed: OwnerId must be a non-empty string.`,
      'Pass a valid owner ID when opening a root popover stack.',
    );
  }
}

/**
 * Asserts that a DOMRect or bounding rectangle contains valid numeric coordinates.
 *
 * @param rect - Rect object to check.
 */
export function assertValidRect(rect: unknown): asserts rect is DOMRect {
  if (!rect || typeof rect !== 'object') {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      'Precondition assertion failed: Invalid geometry rect object.',
      'Pass a valid DOMRect or virtual element with getBoundingClientRect().',
    );
  }
  const r = rect as Partial<DOMRect>;
  if (
    !Number.isFinite(r.top) ||
    !Number.isFinite(r.left) ||
    !Number.isFinite(r.width) ||
    !Number.isFinite(r.height)
  ) {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      'Precondition assertion failed: DOMRect contains NaN or Infinity values.',
      'Ensure element geometry is measured after mounting in the DOM.',
    );
  }
}
