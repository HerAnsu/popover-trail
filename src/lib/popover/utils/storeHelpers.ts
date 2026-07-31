import type { TrailEntry } from '../types';

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
    typeof (value as Record<string, unknown>).then === 'function'
  );
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
      !isDeepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])
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
 * Sanitizes a numeric coordinate value, defaulting NaN to 0.
 */
function sanitizeNum(val: number): number {
  return Number.isNaN(val) ? 0 : val;
}

/**
 * Sanitizes a DOMRect or DOMRectReadOnly object, ensuring valid numeric properties.
 */
export function sanitizeRect(
  rawRect: { x?: number; y?: number; width?: number; height?: number } | null | undefined,
): DOMRect | null {
  if (!rawRect) return null;
  return new DOMRect(
    sanitizeNum(rawRect.x ?? 0),
    sanitizeNum(rawRect.y ?? 0),
    sanitizeNum(rawRect.width ?? 0),
    sanitizeNum(rawRect.height ?? 0),
  );
}

/**
 * Constructs a fully initialized TrailEntry object with defaulted fallbacks.
 */
export function createTrailEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (import('../types').OpenRootOptions & import('../types').OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData>,
  data?: TData,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData> {
  return {
    key,
    parentKey,
    originalParentKey: parentKey ?? existingEntry?.originalParentKey,
    rect: rect ?? existingEntry?.rect,
    originalRect: rect ?? existingEntry?.originalRect,
    data,
    error,
    isLoading,
    collision: options?.collision,
    transitionStatus: 'mounting',
    hover: options?.hover,
    ariaDescribedby: options?.ariaDescribedby,
    allowDragWhenPinned: options?.allowDragWhenPinned,
    allowDragWhenUnpinned: options?.allowDragWhenUnpinned,
    placement: options?.placement,
    offset: options?.offset,
    exitTransitionDuration: options?.exitTransitionDuration,
    baseZIndex: options?.baseZIndex,
    cascadeOffsetStep: options?.cascadeOffsetStep,
    cascadeOffsetDirection: options?.cascadeOffsetDirection,
    enableTilt: options?.enableTilt,
    maxTiltAngle: options?.maxTiltAngle,
    tiltSensitivity: options?.tiltSensitivity,
    dragAxis: options?.dragAxis,
    tiltFriction: options?.tiltFriction,
    tiltDecay: options?.tiltDecay,
    mountingClassName: options?.mountingClassName,
    unmountingClassName: options?.unmountingClassName,
    mountedClassName: options?.mountedClassName,
    buttonControls: options?.buttonControls ?? existingEntry?.buttonControls,
    stackGroup: options?.stackGroup ?? existingEntry?.stackGroup,
    responsiveMode: options?.responsiveMode ?? existingEntry?.responsiveMode,
    layoutStrategy: options?.layoutStrategy ?? existingEntry?.layoutStrategy,
    keyboardShortcuts: options?.keyboardShortcuts ?? existingEntry?.keyboardShortcuts,
    focusLockOptions: options?.focusLockOptions ?? existingEntry?.focusLockOptions,
    onOpen: options?.onOpen ?? existingEntry?.onOpen,
    onClose: options?.onClose ?? existingEntry?.onClose,
    onPin: options?.onPin ?? existingEntry?.onPin,
    onError: options?.onError ?? existingEntry?.onError,
  };
}
