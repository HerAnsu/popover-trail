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
  return typeof (value as { then?: unknown }).then === 'function';
}

/**
 * Safely converts an unknown error/exception catch value to a standard Error instance.
 */
export function toError(err: unknown): Error {
  return err instanceof Error ? err : new Error(String(err));
}

export { shallowEqual, isDeepEqual } from './equality';

export { clsx } from './clsx';

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
      if (Object.hasOwn(options, key)) {
        const val = options[key as keyof typeof options];
        if (val !== undefined) {
          (merged as Record<string, unknown>)[key] = val;
        }
      }
    }
  }
  return merged;
}

function resolveEntryStatus<TData>(
  data?: TData,
  error?: Error | null,
  isLoading = false,
  fallbackStatus: TrailEntry<TData>['status'] = 'loading',
): TrailEntry<TData>['status'] {
  if (data !== undefined && data !== null) return 'success';
  if (error) return 'error';
  if (isLoading) return 'loading';
  return fallbackStatus;
}

function resolveInitialTransitionStatus(
  existing?: PopoverTransitionStatus,
): PopoverTransitionStatus {
  return existing && existing !== 'unmounting' ? existing : 'mounting';
}

function resolveEntryGeometryMetadata<TData>(
  rect: DOMRect | null,
  parentKey: string | undefined,
  existingEntry?: TrailEntry<TData>,
) {
  if (!existingEntry) {
    const validRect = rect || undefined;
    return {
      rect: validRect,
      pinnedLayoutPos: undefined,
      originalParentKey: parentKey,
      originalRect: validRect,
    };
  }

  return {
    rect: rect || existingEntry.rect,
    pinnedLayoutPos: existingEntry.pinnedLayoutPos,
    originalParentKey: existingEntry.originalParentKey || parentKey,
    originalRect: existingEntry.originalRect || rect || undefined,
  };
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
  const geom = resolveEntryGeometryMetadata(rect, parentKey, existingEntry);

  return {
    ...mergedOptions,
    ...geom,
    key,
    parentKey: parentKey ?? undefined,
    transitionStatus: resolveInitialTransitionStatus(existingEntry?.transitionStatus),
    status: resolveEntryStatus(data, error, isLoading, existingEntry?.status),
    isLoading: Boolean(isLoading),
    error: error ?? null,
    data: data ?? existingEntry?.data ?? null,
    dataPromise: existingEntry?.dataPromise ?? undefined,
  };
}

/** Constructs an entry in 'success' status with resolved payload data. */
export function createSuccessEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  data: TData,
  existingEntry?: TrailEntry<TData>,
): TrailEntry<TData> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, data, null, false);
}

/** Constructs an entry in 'loading' status. */
export function createLoadingEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData>,
): TrailEntry<TData> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, true);
}

/** Constructs an entry in 'error' status with an associated Error object. */
export function createErrorEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  error: Error,
  existingEntry?: TrailEntry<TData>,
): TrailEntry<TData> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, error, false);
}

/** Constructs an entry in 'idle' status. */
export function createIdleEntry<TData>(
  key: string,
  parentKey: string | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData>,
): TrailEntry<TData> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, false);
}
