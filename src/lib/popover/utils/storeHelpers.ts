import type {
  TrailEntry,
  OpenRootOptions,
  OpenNestedOptions,
  PopoverTransitionStatus,
} from '../types';
import { toFiniteNumber } from './styles';
import { extractDisplayOptions, mergeDisplayOptions } from './displayOptions';

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
  return 'then' in value && typeof value.then === 'function';
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
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export function getEntryAtIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
): TrailEntry<TData, TPopoverKey> | undefined {
  if (index < 0 || index >= floating.length + trail.length) return undefined;
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
}

/**
 * Finds the virtual index of a popover entry by its unique key ID,
 * combining the floating and trailing array ranges.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export function findEntryIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
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
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export function hasEntryWithKey<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

/**
 * Safely searches for a TrailEntry by key across both floating and trailing lists.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export function findEntryInStore<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): TrailEntry<TData, TPopoverKey> | undefined {
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
 * Canonical Smart Constructor creating an initial TrailEntry conforming to all invariant domain defaults.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param key - Unique popover string identifier.
 * @param options - Visual display and interaction flags.
 * @param ownerId - Optional owning trigger ID.
 * @param parentKey - Optional parent popover key in hierarchy.
 * @returns Fully normalized TrailEntry instance.
 */
export function createInitialTrailEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  options?: Partial<OpenRootOptions & OpenNestedOptions> & { isLoading?: boolean; rect?: DOMRect },
  _ownerId?: string | null,
  parentKey?: TPopoverKey,
): TrailEntry<TData, TPopoverKey> {
  const displayOptions = extractDisplayOptions(options);
  const entry: TrailEntry<TData, TPopoverKey> = {
    key,
    parentKey,
    isLoading: options?.isLoading ?? false,
    error: null,
    transitionStatus: 'mounted',
    ...displayOptions,
  };
  if (options?.rect !== undefined) {
    entry.rect = options.rect;
  }
  return entry;
}

function resolveEntryStatus<TData, TPopoverKey extends string = string>(
  data?: TData,
  error?: Error | null,
  isLoading = false,
  fallbackStatus: TrailEntry<TData, TPopoverKey>['status'] = 'loading',
): TrailEntry<TData, TPopoverKey>['status'] {
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

function resolveEntryGeometryMetadata<TData, TPopoverKey extends string = string>(
  rect: DOMRect | null,
  parentKey: TPopoverKey | undefined,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
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
 * Constructs a fully initialized TrailEntry object with default properties and geometry.
 */
export function createTrailEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey: TPopoverKey | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
  data?: TData,
  error: Error | null = null,
  isLoading = false,
): TrailEntry<TData, TPopoverKey> {
  const baseOptions = existingEntry ? extractDisplayOptions(existingEntry) : {};
  const mergedOptions = mergeDisplayOptions(baseOptions, options);
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
export function createSuccessEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey: TPopoverKey | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  data: TData,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, data, null, false);
}

/** Constructs an entry in 'loading' status. */
export function createLoadingEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey: TPopoverKey | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, true);
}

/** Constructs an entry in 'error' status with an associated Error object. */
export function createErrorEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey: TPopoverKey | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  error: Error,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, error, false);
}

/** Constructs an entry in 'idle' status. */
export function createIdleEntry<TData, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey: TPopoverKey | undefined,
  rect: DOMRect | null,
  options: (OpenRootOptions & OpenNestedOptions) | undefined,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, false);
}
