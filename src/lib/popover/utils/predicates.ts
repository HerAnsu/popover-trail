/**
 * Intention-Revealing Domain Predicates.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/predicates
 */

export interface HasKey {
  readonly key: string;
}

export function isKeyInList<T extends HasKey>(list: readonly T[], key: string): boolean {
  for (const item of list) {
    if (item && item.key === key) return true;
  }
  return false;
}

export function isPopoverActive(
  state: { readonly trail: readonly HasKey[]; readonly floating: readonly HasKey[] },
  key: string,
): boolean {
  return isKeyInList(state.trail, key) || isKeyInList(state.floating, key);
}

export function shouldTrackFloatingGeometry(isPinned?: boolean, isDragging?: boolean): boolean {
  return Boolean(isPinned) || Boolean(isDragging);
}

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

/**
 * Type guard verifying that a value is neither `null` nor `undefined`.
 * Narrowing predicate for array filtering and optional chaining.
 *
 * @template T - Input value type.
 * @param value - Value to inspect.
 * @returns True if value is non-nullable.
 */
export function isNonNullable<T>(value: T): value is NonNullable<T> {
  return value !== null && value !== undefined;
}

/**
 * Type guard asserting that an optional candidate is defined (not `undefined`).
 *
 * @template T - Value type.
 * @param value - Value to inspect.
 * @returns True if value is not `undefined`.
 */
export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

/**
 * Type guard asserting that a nullable candidate is strictly `null`.
 *
 * @template T - Value type.
 * @param value - Value to inspect.
 * @returns True if value is `null`.
 */
export function isNull<T>(value: T | null): value is null {
  return value === null;
}

/**
 * Type guard asserting that an optional candidate is strictly `undefined`.
 *
 * @template T - Value type.
 * @param value - Value to inspect.
 * @returns True if value is `undefined`.
 */
export function isUndefined<T>(value: T | undefined): value is undefined {
  return value === undefined;
}

/**
 * Creates a predicate checking if an object's `key` matches the target string.
 *
 * @template T - Object extending HasKey.
 * @param key - Target key string to match.
 * @returns Predicate function.
 */
export function isMatchingKey<T extends HasKey>(key: string): (item: T) => boolean {
  return (item: T) => item.key === key;
}


/**
 * Creates a predicate checking if an object's `key` is contained within a Set.
 *
 * @template T - Object extending HasKey.
 * @param keys - Set of target key strings.
 * @returns Predicate function.
 */
export function hasKeyIn<T extends HasKey>(keys: ReadonlySet<string>): (item: T) => boolean {
  return (item: T) => keys.has(item.key);
}


