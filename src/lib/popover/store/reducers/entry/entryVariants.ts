/**
 * Variant Entry Node Constructors for Resolved and Lifecycle States.
 *
 * @module store/reducers/entry/entryVariants
 */

import type { TrailEntry, OpenRootOptions, OpenNestedOptions, PopoverRect } from '../../../types';
import { createTrailEntry } from './entryBase';

/**
 * Constructs a TrailEntry initialized in a successfully resolved data state.
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
 * Constructs a TrailEntry initialized in a pending loading state.
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
 * Constructs a TrailEntry initialized in a failed state with an attached Error.
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
 * Constructs a TrailEntry initialized in an idle state without data or errors.
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
