/**
 * Trail & Hierarchy Selector Hooks for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/trailSelectors
 */

import type { TrailEntry } from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import {
  selectActiveTrail,
  selectFloatingEntries,
  selectRootEntry,
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
} from '../../store/selectors';
import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';

/**
 * Retrieves the active non-pinned cascading popover trail ordered from root to leaf.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Branded popover key type.
 * @returns Readonly array of active trail entries.
 *
 * @example
 * ```tsx
 * function TrailBreadcrumbs() {
 *   const trail = usePopoverTrail();
 *   return <span>{trail.map((e) => e.key).join(' > ')}</span>;
 * }
 * ```
 */
export function usePopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): readonly TrailEntry<TData, TPopoverKey>[] {
  return usePopoverStore(selectActiveTrail<TData, TPopoverKey>);
}

/**
 * Retrieves all pinned (floating) popover entries detached from the cascading trail.
 *
 * Pinned popovers remain open and can be independently positioned or dragged across the screen.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Branded popover key type.
 * @returns Readonly array of floating/pinned entries.
 *
 * @example
 * ```tsx
 * function PinnedCardsOverlay() {
 *   const pinned = usePopoverFloating();
 *   return <div>Pinned count: {pinned.length}</div>;
 * }
 * ```
 */
export function usePopoverFloating<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): readonly TrailEntry<TData, TPopoverKey>[] {
  return usePopoverStore(selectFloatingEntries<TData, TPopoverKey>);
}

/**
 * Retrieves the root popover entry of the active trail (the topmost ancestor), or undefined if idle.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Branded popover key type.
 * @returns The root trail entry, or undefined if no popovers are open.
 *
 * @example
 * ```tsx
 * function RootIndicator() {
 *   const root = usePopoverRootEntry();
 *   return root ? <div>Root: {root.key}</div> : null;
 * }
 * ```
 */
export function usePopoverRootEntry<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): TrailEntry<TData, TPopoverKey> | undefined {
  return usePopoverStore(selectRootEntry<TData, TPopoverKey>);
}

/**
 * Returns the total count of active popovers across both the cascading trail and floating pool.
 *
 * @returns Total active popover count.
 *
 * @example
 * ```tsx
 * function ActiveBadge() {
 *   const count = usePopoverActiveCount();
 *   return <span className="badge">{count}</span>;
 * }
 * ```
 */
export function usePopoverActiveCount(): number {
  return usePopoverStore((state) => state.floating.length + state.trail.length);
}

/**
 * Evaluates whether all popovers are closed (idle state).
 *
 * Returns `true` if both active trail and floating entries are completely empty.
 *
 * @returns True if idle, false otherwise.
 *
 * @example
 * ```tsx
 * function IdleBackdrop() {
 *   const isIdle = usePopoverIsIdle();
 *   if (isIdle) return null;
 *   return <div className="backdrop" />;
 * }
 * ```
 */
export function usePopoverIsIdle(): boolean {
  return usePopoverStore((state) => state.floating.length === 0 && state.trail.length === 0);
}

/**
 * Retrieves the parent key of a given popover within the directed acyclic graph.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key whose parent to look up.
 * @returns The parent popover key, or undefined if root/unparented.
 *
 * @example
 * ```tsx
 * const parentKey = usePopoverParentKey('card-sub-menu');
 * ```
 */
export function usePopoverParentKey<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): TPopoverKey | undefined {
  return usePopoverStore(selectParentKey<TPopoverKey>(key));
}

/**
 * Retrieves the direct child popover keys of a given popover.
 *
 * Uses shallow equality memoization to avoid re-renders when children have not changed.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key whose children to query.
 * @returns Readonly array of immediate child keys.
 *
 * @example
 * ```tsx
 * const childKeys = usePopoverChildrenKeys('card-parent');
 * ```
 */
export function usePopoverChildrenKeys<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return usePopoverStore(selectChildrenKeys<TPopoverKey>(key), shallowEqual);
}

/**
 * Retrieves the geodesic path of popover keys from the root down to the specified key.
 *
 * Useful for rendering breadcrumbs, back-navigation trails, or hierarchic trees.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - Target popover key.
 * @returns Array of keys representing the path from root to the target popover.
 *
 * @example
 * ```tsx
 * const path = usePopoverBreadcrumbs('card-item-details');
 * // ['card-main', 'card-list', 'card-item-details']
 * ```
 */
export function usePopoverBreadcrumbs<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return usePopoverStore(selectBreadcrumbs<TPopoverKey>(key), shallowEqual);
}

/**
 * Retrieves the 0-based hierarchy depth of a popover within the active cascade.
 *
 * Root is depth 0, immediate child is depth 1, etc. Returns -1 if the popover is not in the trail.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - Popover key to evaluate.
 * @returns 0-based depth integer, or -1 if not active.
 *
 * @example
 * ```tsx
 * const depth = usePopoverDepth('card-child');
 * ```
 */
export function usePopoverDepth<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): number {
  return usePopoverStore(selectPopoverDepth<TPopoverKey>(key));
}
