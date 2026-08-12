import type { TrailEntry, OpenRootOptions, OpenNestedOptions } from '../types';
import { toFiniteNumber } from './styles';

export {
  updateEntryInLists,
  bringToFrontPatch,
  getCleanupStatePatch,
  openRootState,
  pushNestedState,
  togglePinState,
  closeFromState,
  getRemovedKeysForClose,
  getSnapshotStatePatch,
} from '../store/storeReducers';

/**
 * Type guard to determine if a value is a Promise or a thenable object.
 */
export function isPromise<T>(value: unknown): value is Promise<T> {
  if (value instanceof Promise) return true;
  if ((typeof value !== 'object' && typeof value !== 'function') || value === null) return false;
  return (
    Object.prototype.hasOwnProperty.call(value, 'then') &&
    typeof (value as Record<string, unknown>).then === 'function'
  );
}

/**
 * Shallow equality comparison utility for plain objects and arrays.
 */
export function shallowEqual<T>(objA: T, objB: T): boolean {
  if (Object.is(objA, objB)) return true;
  if (typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null) {
    return false;
  }
  const keysA = Object.keys(objA);
  if (keysA.length !== Object.keys(objB).length) return false;
  const recA = objA as Record<string, unknown>;
  const recB = objB as Record<string, unknown>;
  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(objB, key) || !Object.is(recA[key], recB[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Safely converts an unknown error/exception catch value to a standard Error instance.
 */
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

/**
 * Safely extracts the event target or primary Shadow DOM origin node from an event.
 */
export function getEventTarget<T extends EventTarget = HTMLElement>(e: Event): T | null {
  if (typeof e.composedPath === 'function') {
    const path = e.composedPath();
    if (path.length > 0) return (path[0] as T) ?? (e.target as T | null);
  }
  return (e.target as T | null) ?? null;
}

/**
 * Returns the event propagation path, supporting Shadow DOM composedPath.
 */
export function getEventPath(e: Event): EventTarget[] {
  if (typeof e.composedPath === 'function') {
    return e.composedPath();
  }
  return e.target ? [e.target] : [];
}

/**
 * Inspects event path for elements marked with data-popover-portal or data-popover-ignore-outside.
 */
export function isPortalOrExcludedTarget(e: Event): boolean {
  const path = getEventPath(e);
  for (const target of path) {
    if (target instanceof Element) {
      if (
        target.hasAttribute('data-popover-portal') ||
        target.hasAttribute('data-popover-ignore-outside')
      ) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Lightweight zero-dependency deep equality comparison helper for plain objects, arrays, and primitives.
 */
export function isDeepEqual<T>(a: T, b: T): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== 'object' || a === null || typeof b !== 'object' || b === null) {
    return false;
  }
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!isDeepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (Array.isArray(b)) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  const recA = a as Record<string, unknown>;
  const recB = b as Record<string, unknown>;
  for (const key of keysA) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (!Object.prototype.hasOwnProperty.call(b, key) || !isDeepEqual(recA[key], recB[key])) {
      return false;
    }
  }
  return true;
}

/**
 * Lightweight zero-dependency className concatenation helper.
 */
export function clsx(
  ...inputs: Array<string | boolean | null | undefined | Record<string, boolean | null | undefined>>
): string {
  const classes: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    if (typeof input === 'string') {
      classes.push(input);
    } else if (typeof input === 'object') {
      for (const key in input) {
        if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
        if (input[key]) classes.push(key);
      }
    }
  }
  return classes.join(' ');
}

/**
 * Retrieves a popover entry safely using a virtual index that merges
 * the floating and trailing lists.
 */
export function getEntryAtIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  index: number,
): TrailEntry<TData> | undefined {
  if (index < 0 || index >= floating.length + trail.length) return undefined;
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
}

/**
 * Finds the virtual index of a popover entry by its unique key ID,
 * combining the floating and trailing array ranges.
 */
export function findEntryIndex<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): number {
  const fi = floating.findIndex((e) => e.key === key);
  if (fi !== -1) return fi;
  const ti = trail.findIndex((e) => e.key === key);
  return ti !== -1 ? floating.length + ti : -1;
}

/**
 * Verifies if a popover with the given key is currently active
 * in either the floating or trailing arrays.
 */
export function hasEntryWithKey<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

/**
 * Safely searches for a TrailEntry by key across both floating and trailing lists.
 */
export function findEntryInStore<TData>(
  floating: readonly TrailEntry<TData>[],
  trail: readonly TrailEntry<TData>[],
  key: string,
): TrailEntry<TData> | undefined {
  return floating.find((e) => e.key === key) ?? trail.find((e) => e.key === key);
}

/**
 * Sanitizes a DOMRect or DOMRectReadOnly object, ensuring valid numeric properties.
 */
export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null {
  if (!rawRect) return null;
  return new DOMRect(
    toFiniteNumber(rawRect.x),
    toFiniteNumber(rawRect.y),
    toFiniteNumber(rawRect.width),
    toFiniteNumber(rawRect.height),
  );
}

export function mergeEntryOptions<TData>(
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData>,
): Partial<TrailEntry<TData>> {
  const merged: Partial<TrailEntry<TData>> = {};
  if (existingEntry) {
    Object.assign(merged, existingEntry);
  }
  if (options) {
    for (const key in options) {
      if (Object.prototype.hasOwnProperty.call(options, key)) {
        const val = options[key as keyof typeof options];
        if (val !== undefined) {
          (merged as Record<string, unknown>)[key] = val;
        }
      }
    }
  }
  return merged;
}

/**
 * Constructs a fully initialized TrailEntry object with defaulted fallbacks.
 */
export function createTrailEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData>,
  data?: TData,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData> {
  const mergedOptions = mergeEntryOptions(options, existingEntry);

  return {
    ...mergedOptions,
    key: key,
    parentKey: parentKey ?? undefined,
    rect: rect ?? existingEntry?.rect ?? undefined,
    pinnedLayoutPos: existingEntry?.pinnedLayoutPos ?? undefined,
    originalParentKey: parentKey ?? existingEntry?.originalParentKey ?? undefined,
    originalRect: rect ?? existingEntry?.originalRect ?? undefined,
    transitionStatus: 'mounting',
    status:
      data !== undefined && data !== null
        ? 'success'
        : error
          ? 'error'
          : isLoading
            ? 'loading'
            : (existingEntry?.status ?? 'loading'),
    isLoading: isLoading ?? false,
    error: error ?? null,
    data: data ?? existingEntry?.data ?? null,
    dataPromise: existingEntry?.dataPromise ?? undefined,
  };
}
