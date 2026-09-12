/**
 * String and Primitive Type Guards.
 *
 * @module utils/guards/stringGuards
 */

/**
 * Type guard verifying that a value is a non-empty string (excluding whitespace-only strings).
 */
export function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Type guard verifying that a value is a function.
 */
export function isFunction(value: unknown): value is (...args: unknown[]) => unknown {
  return typeof value === 'function';
}

/**
 * Type guard verifying that a value is a non-null object record.
 */
export function isRecordObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
