/**
 * Fast deep/shallow clone helper that utilizes V8 native structuredClone when available.
 * Falls back safely to shallow object/array copying if structuredClone is unavailable or fails.
 */
export function fastClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (typeof structuredClone === 'function') {
    try {
      return structuredClone(obj);
    } catch {
      // Fallback for DOM nodes, functions, or symbol keys inside payload
    }
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  if (obj instanceof RegExp) {
    return new RegExp(obj.source, obj.flags) as unknown as T;
  }

  if (obj instanceof Map) {
    const mapCopy = new Map();
    for (const [k, v] of obj.entries()) {
      mapCopy.set(k, fastClone(v));
    }
    return mapCopy as unknown as T;
  }

  if (obj instanceof Set) {
    const setCopy = new Set();
    for (const v of obj.values()) {
      setCopy.add(fastClone(v));
    }
    return setCopy as unknown as T;
  }

  if (Array.isArray(obj)) {
    const len = obj.length;
    const copy = Array.from({ length: len });
    for (let i = 0; i < len; i++) {
      copy[i] = fastClone(obj[i]);
    }
    return copy as unknown as T;
  }

  return { ...obj };
}
