/**
 * Pure Action Predicates and Store Actions Composition Root.
 *
 * @module storeActions
 */

import type { PopoverActions, PopoverRect, PopoverStateData, StatePatch } from '../../types';
import type { SliceContext } from '../slices';
import type { StoreSetFn, StoreGetFn } from '../storeTypes';
import type { ActionRegistryDependencies } from './storeActionRegistryTypes';
import { createActionRegistry } from './storeActionRegistry';
import { logger } from '../../utils/logger';
import { togglePinState, updateOffsetState } from '../reducers/pinning/pinReducers';

/**
 * Checks whether a given popover key is currently marked as pinned.
 *
 * @example
 * ```ts
 * const pinned = isPinnedEntry(state.pinnedStates, 'profileCard');
 * ```
 *
 * @param pinnedStates - Dictionary of pinned boolean flags by key.
 * @param key - Popover key to check.
 * @returns True if the key is pinned.
 */
export function isPinnedEntry(
  pinnedStates: Readonly<Partial<Record<string, boolean>>>,
  key: string,
): boolean {
  return Boolean(pinnedStates[key]);
}

/**
 * Checks whether a popover key is present in the z-index ordering list.
 *
 * @example
 * ```ts
 * const present = isKeyInZIndexOrder(state.zIndexOrder, 'profileCard');
 * ```
 *
 * @param zIndexOrder - Ordered array of popover keys.
 * @param key - Popover key to check.
 * @returns True if key is present in zIndexOrder.
 */
export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean {
  return zIndexOrder.includes(key);
}

/**
 * Pure reducer helper computing state patch when toggling pin mode.
 *
 * @example
 * ```ts
 * const patch = reduceTogglePinState(state, 'card-1', rect);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - Current store state snapshot.
 * @param key - Popover key to toggle.
 * @param rect - Optional active bounding rectangle.
 * @returns State patch with toggled pin state.
 */
export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect | PopoverRect,
): StatePatch<TData, TContext, TPopoverKey> {
  return togglePinState(state, key, rect);
}

/**
 * Pure reducer helper computing state patch when updating drag offset coordinates.
 *
 * @example
 * ```ts
 * const patch = reduceUpdateOffsetState(state, 'card-1', { x: 10, y: 20 });
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param state - Current store state snapshot.
 * @param key - Identifier of dragged popover.
 * @param offset - New drag coordinates `{ x, y }`.
 * @returns State patch with updated offsets.
 */
export function reduceUpdateOffsetState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: { x: number; y: number },
): StatePatch<TData, TContext, TPopoverKey> {
  return updateOffsetState(state, key, offset);
}

/**
 * Composition root factory aggregating all core and custom store actions.
 *
 * @example
 * ```ts
 * const actions = createStoreActions(set, get, dependencies);
 * actions.openRoot('root');
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TCustomActions - Type of additional custom slice actions.
 * @param set - Store setter function.
 * @param get - Store getter function.
 * @param deps - Action registry dependencies.
 * @returns Unified object containing all store actions.
 */
export function createStoreActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TCustomActions extends object = object,
>(
  set: StoreSetFn<TData, TContext, TPopoverKey>,
  get: StoreGetFn<TData, TContext, TPopoverKey>,
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>,
): PopoverActions<TData, TContext, TPopoverKey> & TCustomActions {
  const coreActions = createActionRegistry<TData, TContext, TPopoverKey>(set, get, deps);
  const { customSlices } = deps;
  if (!customSlices || customSlices.length === 0) {
    return coreActions as PopoverActions<TData, TContext, TPopoverKey> & TCustomActions;
  }
  const reservedCoreActionNames: ReadonlySet<string> = new Set(Object.keys(coreActions));
  const mergedActions: Record<string, unknown> = { ...coreActions };
  const ctx: SliceContext<TData, TContext, TPopoverKey> = { set, get, deps };
  for (const descriptor of customSlices) {
    const extension = descriptor.create(ctx);
    if (!extension || typeof extension !== 'object') continue;
    for (const [actionName, actionFn] of Object.entries(extension)) {
      if (reservedCoreActionNames.has(actionName)) {
        logger.warn(
          `[popover-trail OCP Warning]: Custom slice "${descriptor.name}" attempted to override reserved core action "${actionName}". Core action was preserved.`,
        );
        continue;
      }
      mergedActions[actionName] = actionFn;
    }
  }
  return mergedActions as PopoverActions<TData, TContext, TPopoverKey> & TCustomActions;
}
