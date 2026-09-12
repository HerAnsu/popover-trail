/**
 * Fail-Fast Diagnostic Invariant Assertion Utility.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/invariant
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
