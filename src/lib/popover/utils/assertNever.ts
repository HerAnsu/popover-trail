/**
 * Compile-time Exhaustiveness Check Utility.
 * Guarantees at compile-time that all cases in a discriminated union or enum
 * have been handled. If reachable at runtime, throws a descriptive TypeError.
 *
 * @module utils/assertNever
 */

/**
 * Asserts that a value is of type `never`.
 * Used as the default branch in exhaustive switch / pattern matches.
 *
 * @param value - The value expected to be never.
 * @param message - Optional contextual error message.
 * @returns never
 * @throws {TypeError} At runtime if this branch is executed.
 */
export function assertNever(value: never, message?: string): never {
  throw new TypeError(
    message ?? `[popover-trail]: Unexpected unhandled union member: ${JSON.stringify(value)}`,
  );
}
