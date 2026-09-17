/**
 * Intention-Revealing Domain Predicates.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/predicates
 */

import { curry2 } from './functional';

export interface HasKey {
  readonly key: string;
}

/**
 * Checks whether an object with the specified `key` exists in an array.
 * Fast iteration with early return and zero allocations.
 *
 * @template T - Element type extending HasKey.
 * @param list - Array of keyed elements.
 * @param key - Identifier string to find.
 * @returns True if an element with the exact key exists.
 *
 * @example
 * ```typescript
 * const entries = [{ key: 'card-1' }, { key: 'card-2' }];
 * isKeyInList(entries, 'card-1'); // => true
 * isKeyInList(entries, 'card-3'); // => false
 * ```
 */
export function isKeyInList<T extends HasKey>(list: readonly T[], key: string): boolean {
  for (const item of list) {
    if (item && item.key === key) return true;
  }
  return false;
}

/**
 * Checks whether a popover key is actively present in either the cascading trail or floating list.
 *
 * @param state - Trail and floating entry lists.
 * @param key - Popover key to check.
 * @returns True if the key is active in trail or floating entries.
 *
 * @example
 * ```typescript
 * const isActive = isPopoverActive(storeState, 'card-profile');
 * ```
 */
export function isPopoverActive(
  state: { readonly trail: readonly HasKey[]; readonly floating: readonly HasKey[] },
  key: string,
): boolean {
  return isKeyInList(state.trail, key) || isKeyInList(state.floating, key);
}

/**
 * Determines whether floating geometry (drag/pin offsets) needs active tracking.
 *
 * @param isPinned - Whether popover is currently pinned.
 * @param isDragging - Whether popover is actively being dragged.
 * @returns True if pinned or dragging.
 *
 * @example
 * ```typescript
 * if (shouldTrackFloatingGeometry(entry.isPinned, entry.isDragging)) {
 *   syncCoordinates();
 * }
 * ```
 */
export function shouldTrackFloatingGeometry(isPinned?: boolean, isDragging?: boolean): boolean {
  return Boolean(isPinned) || Boolean(isDragging);
}

/**
 * Compares two animation class name configuration objects for visual changes.
 *
 * @param prev - Previous animation class configuration.
 * @param next - Next animation class configuration.
 * @returns True if class names have changed and require a CSS re-computation.
 *
 * @example
 * ```typescript
 * if (hasAnimationClassNamesChanged(prevClasses, nextClasses)) {
 *   updateClassNames();
 * }
 * ```
 */
export function hasAnimationClassNamesChanged(
  prev?: {
    readonly mountingClassName?: string;
    readonly unmountingClassName?: string;
    readonly mountedClassName?: string;
  },
  next?: {
    readonly mountingClassName?: string;
    readonly unmountingClassName?: string;
    readonly mountedClassName?: string;
  },
): boolean {
  if (prev === next) return false;
  if (!prev || !next) return true;
  return (
    prev.mountingClassName !== next.mountingClassName ||
    prev.unmountingClassName !== next.unmountingClassName ||
    prev.mountedClassName !== next.mountedClassName
  );
}

/** Type guard verifying that a value is neither `null` nor `undefined`. */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/** Type guard asserting that an optional candidate is defined (not `undefined`). */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/** Type guard asserting that a nullable candidate is strictly `null`. */
export function isNull<T>(value: T | null): value is null {
  return value === null;
}

/** Type guard asserting that an optional candidate is strictly `undefined`. */
export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

/**
 * Creates a predicate checking if an object's `key` matches the target string.
 *
 * @template T - Object extending HasKey.
 * @param key - Target key string to match.
 * @returns Predicate function.
 *
 * @example
 * ```typescript
 * const matchesCardA = isMatchingKey('card-a');
 * const target = items.find(matchesCardA);
 * ```
 */
export function isMatchingKey<T extends HasKey>(key: string): (item: T) => boolean {
  return curry2((k: string, item: T) => item.key === k)(key);
}

/**
 * Creates a predicate checking if an object's `key` is contained within a Set.
 *
 * @template T - Object extending HasKey.
 * @param keys - Set of target key strings.
 * @returns Predicate function.
 *
 * @example
 * ```typescript
 * const activeKeys = new Set(['card-1', 'card-2']);
 * const isInActiveSet = hasKeyIn(activeKeys);
 * const filtered = items.filter(isInActiveSet);
 * ```
 */
export function hasKeyIn<T extends HasKey>(keys: ReadonlySet<string>): (item: T) => boolean {
  return curry2((set: ReadonlySet<string>, item: T) => set.has(item.key))(keys);
}


