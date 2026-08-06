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

  if (Array.isArray(obj)) {
    return obj.map(fastClone) as unknown as T;
  }

  return { ...obj };
}
