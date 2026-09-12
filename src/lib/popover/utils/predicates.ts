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
