/**
 * Fail-Fast Diagnostic Invariant Assertion Utility.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/invariant
 */

/**
 * Fail-fast invariant assertion guard.
 * Validates that `condition` is truthy, throwing a formatted descriptive error if false.
 * Narrowing predicate for TypeScript control flow analysis.
 *
 * @param condition - Candidate truthy condition to assert.
 * @param messageOrFactory - Diagnostic message string or error factory function.
 * @throws {Error} If condition evaluates to falsy.
 *
 * @example
 * ```typescript
 * invariant(store != null, 'Store must be initialized before dispatching actions');
 * invariant(entry.depth <= 10, () => new RangeError('Cascade depth exceeded'));
 * ```
 */
export function invariant(
  condition: unknown,
  messageOrFactory: string | (() => Error | string),
): asserts condition {
  if (!condition) {
    if (typeof messageOrFactory === 'function') {
      const err = messageOrFactory();
      throw typeof err === 'string' ? new Error(`[Popover Trail] ${err}`) : err;
    }
    throw new Error(`[Popover Trail] ${messageOrFactory}`);
  }
}
