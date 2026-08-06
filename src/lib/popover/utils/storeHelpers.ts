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
  return (
    ((typeof value === 'object' && value !== null) || typeof value === 'function') &&
    'then' in value &&
    typeof (value as { then?: unknown }).then === 'function'
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
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (
      !Object.prototype.hasOwnProperty.call(objB, key) ||
      !Object.is(Reflect.get(objA, key), Reflect.get(objB, key))
    ) {
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
    if (target && typeof (target as Element).getAttribute === 'function') {
      const el = target as Element;
      if (
        el.getAttribute('data-popover-portal') !== null ||
        el.getAttribute('data-popover-ignore-outside') !== null
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
  for (const key of keysA) {
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') continue;
    if (
      !Object.prototype.hasOwnProperty.call(b, key) ||
      !isDeepEqual(Reflect.get(a, key), Reflect.get(b, key))
    ) {
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
  for (let i = 0; i < inputs.length; i++) {
    const input = inputs[i];
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
  return {
    key: key,
    parentKey: parentKey ?? undefined,
    rect: rect ?? existingEntry?.rect ?? undefined,
    pinnedLayoutPos: existingEntry?.pinnedLayoutPos ?? undefined,
    originalParentKey: parentKey ?? existingEntry?.originalParentKey ?? undefined,
    originalRect: rect ?? existingEntry?.originalRect ?? undefined,
    transitionStatus: 'mounting',
    status: existingEntry?.status ?? undefined,
    isLoading: isLoading ?? false,
    error: error ?? null,
    data: data ?? existingEntry?.data ?? null,
    dataPromise: existingEntry?.dataPromise ?? undefined,
    collision: options?.collision ?? existingEntry?.collision ?? undefined,
    hover: options?.hover ?? existingEntry?.hover ?? undefined,
    ariaDescribedby: options?.ariaDescribedby ?? existingEntry?.ariaDescribedby ?? undefined,
    allowDragWhenPinned:
      options?.allowDragWhenPinned ?? existingEntry?.allowDragWhenPinned ?? undefined,
    allowDragWhenUnpinned:
      options?.allowDragWhenUnpinned ?? existingEntry?.allowDragWhenUnpinned ?? undefined,
    placement: options?.placement ?? existingEntry?.placement ?? undefined,
    offset: options?.offset ?? existingEntry?.offset ?? undefined,
    exitTransitionDuration:
      options?.exitTransitionDuration ?? existingEntry?.exitTransitionDuration ?? undefined,
    baseZIndex: options?.baseZIndex ?? existingEntry?.baseZIndex ?? undefined,
    cascadeOffsetStep: options?.cascadeOffsetStep ?? existingEntry?.cascadeOffsetStep ?? undefined,
    cascadeOffsetDirection:
      options?.cascadeOffsetDirection ?? existingEntry?.cascadeOffsetDirection ?? undefined,
    enableTilt: options?.enableTilt ?? existingEntry?.enableTilt ?? undefined,
    maxTiltAngle: options?.maxTiltAngle ?? existingEntry?.maxTiltAngle ?? undefined,
    tiltSensitivity: options?.tiltSensitivity ?? existingEntry?.tiltSensitivity ?? undefined,
    dragAxis: options?.dragAxis ?? existingEntry?.dragAxis ?? undefined,
    tiltFriction: options?.tiltFriction ?? existingEntry?.tiltFriction ?? undefined,
    tiltDecay: options?.tiltDecay ?? existingEntry?.tiltDecay ?? undefined,
    mountingClassName: options?.mountingClassName ?? existingEntry?.mountingClassName ?? undefined,
    unmountingClassName:
      options?.unmountingClassName ?? existingEntry?.unmountingClassName ?? undefined,
    mountedClassName: options?.mountedClassName ?? existingEntry?.mountedClassName ?? undefined,
    buttonControls: options?.buttonControls ?? existingEntry?.buttonControls ?? undefined,
    stackGroup: options?.stackGroup ?? existingEntry?.stackGroup ?? undefined,
    responsiveMode: options?.responsiveMode ?? existingEntry?.responsiveMode ?? undefined,
    layoutStrategy: options?.layoutStrategy ?? existingEntry?.layoutStrategy ?? undefined,
    keyboardShortcuts: options?.keyboardShortcuts ?? existingEntry?.keyboardShortcuts ?? undefined,
    focusLockOptions: options?.focusLockOptions ?? existingEntry?.focusLockOptions ?? undefined,
    onOpen: options?.onOpen ?? existingEntry?.onOpen ?? undefined,
    onClose: options?.onClose ?? existingEntry?.onClose ?? undefined,
    onPin: options?.onPin ?? existingEntry?.onPin ?? undefined,
    onError: options?.onError ?? existingEntry?.onError ?? undefined,
  };
}
