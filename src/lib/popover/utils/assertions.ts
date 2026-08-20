/**
 * Design by Contract Assertion Precondition Guards for popover-trail.
 * Provides fail-fast validation with automatic TypeScript type narrowing.
 *
 * @module assertions
 */

import { PopoverError, PopoverErrorCode } from './errors';
import type { PopoverKey, OwnerId } from '../types/storeTypes';

/**
 * Asserts that a value is non-nullable (neither null nor undefined).
 * Throws a PopoverError if the assertion fails.
 *
 * @template T - Input value type.
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
 * Asserts that a key string is a valid, non-empty PopoverKey.
 *
 * @param key - Identifier value to validate.
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
 * Asserts that a value is a valid, non-empty OwnerId string.
 *
 * @param ownerId - Owner identifier value to validate.
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
 * Asserts that a DOMRect or bounding rectangle contains valid, finite numeric coordinates.
 *
 * @param rect - Rect object to validate.
 */
export function assertValidRect(rect: unknown): asserts rect is DOMRect {
  if (!rect || typeof rect !== 'object') {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      'Precondition assertion failed: Invalid geometry rect object.',
      'Pass a valid DOMRect or virtual element with getBoundingClientRect().',
    );
  }
  if (
    !('top' in rect) ||
    !Number.isFinite(rect.top) ||
    !('left' in rect) ||
    !Number.isFinite(rect.left) ||
    !('width' in rect) ||
    !Number.isFinite(rect.width) ||
    !('height' in rect) ||
    !Number.isFinite(rect.height)
  ) {
    throw new PopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      'Precondition assertion failed: DOMRect contains NaN or Infinity values.',
      'Ensure element geometry is measured after mounting in the DOM.',
    );
  }
}
