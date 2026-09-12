/**
 * Circular-Safe JSON Stringification and Robust Parsing.
 *
 * @module store/persistence/safeJson
 */

/**
 * Stringifies arbitrary values safely guarding against circular references and undefined.
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
 * Safely parses JSON strings into typed data structures returning null on failure or invalid input.
 * Supports optional runtime type guard for guaranteed type safety.
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

export const serializeJson = safeJsonStringify;
