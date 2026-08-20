import { wrapResult, isOk } from './result';

function cloneBuiltinInstance(obj: object): object | null {
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj.source, obj.flags);
  if (obj instanceof Map) {
    const mapCopy = new Map();
    for (const [k, v] of obj.entries()) {
      mapCopy.set(k, fastClone(v));
    }
    return mapCopy;
  }
  if (obj instanceof Set) {
    const setCopy = new Set();
    for (const v of obj.values()) {
      setCopy.add(fastClone(v));
    }
    return setCopy;
  }
  return null;
}

/**
 * Deep-clones state objects and data payloads using the fastest available strategy.
 *
 * @remarks
 * Utilizes native `structuredClone` when supported, and gracefully falls back to recursive
 * object/array/Map/Set cloning when non-serializable properties (e.g. functions, DOM nodes) are encountered.
 *
 * @template T - Input object type.
 * @param obj - Object, array, or primitive value to clone.
 * @returns An isolated deep copy of the input value.
 */
export function fastClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (typeof structuredClone === 'function') {
    const cloneResult = wrapResult(() => structuredClone(obj));
    if (isOk(cloneResult)) {
      return cloneResult.data;
    }
  }

  const builtinClone = cloneBuiltinInstance(obj);
  if (builtinClone) {
    return builtinClone as T;
  }

  if (Array.isArray(obj)) {
    const copy = obj.map((item) => fastClone(item));
    return copy as T;
  }

  return { ...obj };
}
