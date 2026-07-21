/**
 * Asserts a condition truthiness at runtime. If condition is falsy, throws an Error
 * with a standardized `[Popover Trail]` prefix.
 *
 * @param condition - The boolean condition to evaluate.
 * @param message - The error message string.
 * @throws {Error} If condition is falsy.
 */
export function invariant(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(`[Popover Trail] ${message}`);
  }
}
