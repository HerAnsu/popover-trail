/**
 * Variant Entry Node Constructors for Resolved and Lifecycle States.
 *
 * @module store/reducers/entry/entryVariants
 */

import type { TrailEntry, OpenRootOptions, OpenNestedOptions, PopoverRect } from '../../../types';
import { createTrailEntry } from './entryBase';

/**
 * Constructs a `TrailEntry` initialized in a successfully resolved data state.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Popover key identifier.
 * @param parentKey - Optional parent popover key.
 * @param rect - Optional trigger bounding rect.
 * @param options - Optional placement and display options.
 * @param existingEntry - Optional prior entry to preserve geometry and metadata.
 * @param data - Resolved payload data.
 * @returns Fully constructed resolved `TrailEntry`.
 *
 * @example
 * ```typescript
 * const entry = createSuccessEntry('profile', 'menu', triggerRect, undefined, undefined, { name: 'Alex' });
 * ```
 */
export function createSuccessEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
  data?: TData | null,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, data, null, false);
}

/**
 * Constructs a `TrailEntry` initialized in a pending loading state (`isLoading: true`).
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Popover key identifier.
 * @param parentKey - Optional parent popover key.
 * @param rect - Optional trigger bounding rect.
 * @param options - Optional placement and display options.
 * @param existingEntry - Optional prior entry to preserve geometry from.
 * @returns Fully constructed loading `TrailEntry`.
 *
 * @example
 * ```typescript
 * const entry = createLoadingEntry('async-card', 'root', triggerRect);
 * ```
 */
export function createLoadingEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, true);
}

/**
 * Constructs a `TrailEntry` initialized in a failed state with an attached Error.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Popover key identifier.
 * @param parentKey - Optional parent popover key.
 * @param rect - Optional trigger bounding rect.
 * @param options - Optional placement and display options.
 * @param error - Error instance or null.
 * @param existingEntry - Optional prior entry to preserve geometry from.
 * @returns Fully constructed error `TrailEntry`.
 *
 * @example
 * ```typescript
 * const entry = createErrorEntry('async-card', 'root', triggerRect, undefined, new Error('Timeout'));
 * ```
 */
export function createErrorEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | PopoverRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  error?: Error | null,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(
    key,
    parentKey,
    rect,
    options,
    existingEntry,
    undefined,
    error ?? null,
    false,
  );
}

/**
 * Constructs a `TrailEntry` initialized in an idle unhydrated state without data or errors.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param key - Popover key identifier.
 * @param parentKey - Optional parent popover key.
 * @param rect - Optional trigger bounding rect.
 * @param options - Optional placement and display options.
 * @param existingEntry - Optional prior entry to preserve geometry from.
 * @returns Fully constructed idle `TrailEntry`.
 *
 * @example
 * ```typescript
 * const entry = createIdleEntry('card-1', 'root', triggerRect);
 * ```
 */
export function createIdleEntry<TData = unknown, TPopoverKey extends string = string>(
  key: TPopoverKey,
  parentKey?: TPopoverKey,
  rect?: DOMRect | null,
  options?: OpenRootOptions & OpenNestedOptions,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return createTrailEntry(key, parentKey, rect, options, existingEntry, undefined, null, false);
}
