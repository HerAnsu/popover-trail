/**
 * Circular-Safe JSON Stringification and Robust Parsing.
 *
 * @module store/persistence/safeJson
 */

/**
 * Serializes arbitrary values into a JSON string, safely guarding against circular references.
 *
 * @remarks
 * Uses a `WeakSet` to track visited objects and omit cycles, preventing `TypeError: Converting circular structure to JSON`.
 * Returns `'null'` on unhandled serialization errors or `undefined` inputs.
 *
 * @example
 * ```ts
 * const json = safeJsonStringify({ a: 1, nested: { b: 2 } });
 * ```
 *
 * @param value - Value to serialize.
 * @returns Safe JSON string representation or `'null'`.
 */
export function safeJsonStringify(value: unknown): string {
  if (value === undefined) return 'null';
  const seen = new WeakSet();
  try {
    const res = JSON.stringify(value, (_key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) return undefined;
        seen.add(val);
      }
      return val;
    });
    return typeof res === 'string' ? res : 'null';
  } catch {
    return 'null';
  }
}

/**
 * Safely parses a JSON string into a typed data structure without throwing exceptions.
 *
 * @remarks
 * Returns `null` on syntax errors, non-string inputs, or empty strings.
 * If an optional `guard` predicate is provided, validates that the parsed value conforms to type `T`.
 *
 * @example
 * ```ts
 * const user = safeJsonParse(rawString, isUser);
 * if (user) {
 *   console.log(user.name);
 * }
 * ```
 *
 * @template T - Expected output type.
 * @param raw - Input string to parse.
 * @param guard - Optional runtime type guard validating the parsed output.
 * @returns Parsed value of type `T`, or `null` on syntax or validation failure.
 */
export function safeJsonParse<T = unknown>(
  raw: unknown,
  guard?: (val: unknown) => val is T,
): T | null {
  if (typeof raw !== 'string' || raw.trim().length === 0) {
    return null;
  }
  try {
    const parsed: unknown = JSON.parse(raw);
    if (guard) {
      return guard(parsed) ? parsed : null;
    }
    return parsed as T;
  } catch {
    return null;
  }
}
