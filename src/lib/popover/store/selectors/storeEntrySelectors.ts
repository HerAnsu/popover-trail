/**
 * Individual Entry and Property Selectors.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module storeEntrySelectors
 */

import type { TrailEntry, DragOffset } from '../../types';
import { findEntryInStore, hasEntryWithKey } from '../../utils/storeHelpers';
import { first, last } from '../../utils/arrayUtils';
import { ZERO_OFFSET } from '../hydration';
import type {
  HasActiveEntriesState,
  HasOffsetsState,
  HasPinnedStates,
  HasZIndexState,
  HasStatusState,
} from './storeSelectorTypes';

/**
 * Selector factory returning a specific TrailEntry by its unique popover key.
 * Searches both floating (pinned) and active cascading trail arrays.
 *
 * @example
 * ```ts
 * const entry = selectEntryByKey('user-popover')(store.getState());
 * if (entry) console.log(entry.status, entry.data);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to find.
 * @returns Selector mapping state to TrailEntry or undefined if not active.
 */
export const selectEntryByKey =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): TrailEntry<TData, TPopoverKey> | undefined =>
    findEntryInStore(state.floating, state.trail, key);

/**
 * Selector factory checking whether an entry with the given key is currently active.
 *
 * @example
 * ```ts
 * const isOpen = selectHasEntry('settings')(store.getState());
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to verify.
 * @returns Selector mapping state to boolean.
 */
export const selectHasEntry =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    hasEntryWithKey(state.floating, state.trail, key);

/**
 * Selects the root entry of the active cascading trail (depth 0).
 *
 * @example
 * ```ts
 * const root = selectRootEntry(store.getState());
 * console.log('Root key:', root?.key);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object containing the active trail array.
 * @returns Root TrailEntry or undefined if trail is empty.
 */
export function selectRootEntry<TData = unknown, TPopoverKey extends string = string>(state: {
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
}): TrailEntry<TData, TPopoverKey> | undefined {
  return first(state.trail);
}

/**
 * Selector factory returning whether the entry for the specified key is currently loading.
 *
 * @example
 * ```ts
 * const isLoading = selectIsLoading('preview-card')(store.getState());
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to check.
 * @returns Selector mapping state to boolean loading state.
 */
export const selectIsLoading =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): boolean =>
    findEntryInStore(state.floating, state.trail, key)?.isLoading ?? false;

/**
 * Selector factory returning any resolution error associated with the specified popover key.
 *
 * @example
 * ```ts
 * const error = selectError('details')(store.getState());
 * if (error) console.error('Failed to load popover:', error.message);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to check.
 * @returns Selector mapping state to Error object or null.
 */
export const selectError =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): Error | null =>
    findEntryInStore(state.floating, state.trail, key)?.error ?? null;

/**
 * Selector factory returning the resolved payload data for the specified popover key.
 *
 * @example
 * ```ts
 * const data = selectData<UserData>('user-card')(store.getState());
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to retrieve data for.
 * @returns Selector mapping state to data payload or null.
 */
export const selectData =
  <TData = unknown, TPopoverKey extends string = string>(key: string) =>
  (state: HasActiveEntriesState<TData, TPopoverKey>): TData | null =>
    findEntryInStore(state.floating, state.trail, key)?.data ?? null;

/**
 * Selector factory returning the parent key of the specified popover.
 * Checks `parentKey` first, falling back to `originalParentKey`.
 *
 * @example
 * ```ts
 * const parentKey = selectParentKey('child-popover')(store.getState());
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Child popover key.
 * @returns Selector mapping state to parent key or undefined if root/unmatched.
 */
export function selectParentKey<TPopoverKey extends string = string>(key: string) {
  return (state: HasActiveEntriesState<unknown, TPopoverKey>): TPopoverKey | undefined => {
    const entry = selectEntryByKey<unknown, TPopoverKey>(key)(state);
    return entry?.parentKey ?? entry?.originalParentKey;
  };
}

/**
 * Selector factory returning the 2D drag offset coordinates for the specified popover key.
 * Returns frozen zero vector `{ x: 0, y: 0 }` if no offset has been applied.
 *
 * @example
 * ```ts
 * const { x, y } = selectOffset('draggable-card')(store.getState());
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key.
 * @returns Selector mapping state to DragOffset coordinates.
 */
export function selectOffset<TPopoverKey extends string = string>(key: TPopoverKey) {
  return (state: HasOffsetsState<TPopoverKey>): DragOffset => state.offsets[key] ?? ZERO_OFFSET;
}

/**
 * Selector factory returning whether the specified popover is pinned to the floating layer.
 *
 * @example
 * ```ts
 * const pinned = selectIsPinned('pinned-tool')(store.getState());
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param key - Popover key to check.
 * @returns Selector mapping state to boolean.
 */
export function selectIsPinned<TPopoverKey extends string = string>(key: TPopoverKey) {
  return (state: HasPinnedStates<TPopoverKey>): boolean => Boolean(state.pinnedStates[key]);
}

/**
 * Selects the ordered array of popover keys reflecting visual stacking order from bottom to top.
 *
 * @example
 * ```ts
 * const order = selectZIndexOrder(store.getState());
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object with zIndexOrder array.
 * @returns Readonly array of popover keys.
 */
export function selectZIndexOrder<TPopoverKey extends string = string>(
  state: HasZIndexState<TPopoverKey>,
): readonly TPopoverKey[] {
  return state.zIndexOrder;
}

/**
 * Selects the topmost active popover entry currently rendered with the highest z-index.
 * Prioritizes the last key in `zIndexOrder`, falling back to the tail of trail or floating.
 *
 * @example
 * ```ts
 * const top = selectTopmostEntry(store.getState());
 * if (top) console.log('Active front popover:', top.key);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object with entries and z-index order.
 * @returns Topmost TrailEntry or undefined if no entries are open.
 */
export function selectTopmostEntry<TData = unknown, TPopoverKey extends string = string>(
  state: HasActiveEntriesState<TData, TPopoverKey> & HasZIndexState<TPopoverKey>,
): TrailEntry<TData, TPopoverKey> | undefined {
  const { zIndexOrder, floating, trail } = state;
  if (zIndexOrder.length === 0) return last(trail) ?? last(floating);
  const topmostKey = last(zIndexOrder);
  return topmostKey ? findEntryInStore(floating, trail, topmostKey) : undefined;
}

/**
 * Selects the high-level operational status of the popover system:
 * - `'idle'`: No popovers open in trail or floating layer.
 * - `'active-trail'`: At least one cascading trail entry is open.
 * - `'pinned-only'`: Cascading trail is empty, but pinned popovers remain floating.
 *
 * @example
 * ```ts
 * const status = selectDiscriminatedStatus(store.getState());
 * if (status === 'idle') renderPlaceholder();
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - State object with trail and floating arrays.
 * @returns Current high-level status union.
 */
export function selectDiscriminatedStatus<TData = unknown, TPopoverKey extends string = string>(
  state: HasStatusState<TData, TPopoverKey>,
): 'idle' | 'active-trail' | 'pinned-only' {
  if (state.trail.length > 0) return 'active-trail';
  return state.floating.length > 0 ? 'pinned-only' : 'idle';
}
