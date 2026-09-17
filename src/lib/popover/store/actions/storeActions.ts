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

export function isPinnedEntry(
  pinnedStates: Readonly<Partial<Record<string, boolean>>>,
  key: string,
): boolean {
  return Boolean(pinnedStates[key]);
}

export function isKeyInZIndexOrder(zIndexOrder: readonly string[], key: string): boolean {
  return zIndexOrder.includes(key);
}

export function reduceTogglePinState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  rect?: DOMRect | PopoverRect,
): StatePatch<TData, TContext, TPopoverKey> {
  return togglePinState(state, key, rect);
}

export function reduceUpdateOffsetState<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
  key: TPopoverKey,
  offset: { x: number; y: number },
): StatePatch<TData, TContext, TPopoverKey> {
  return updateOffsetState(state, key, offset);
}

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
  const ctx: SliceContext<TData, TContext, TPopoverKey> = { set, get, deps };
  const coreActions = createActionRegistry<TData, TContext, TPopoverKey>(set, get, deps);
  const customSlices = deps.customSlices;
  if (!customSlices || customSlices.length === 0) {
    return coreActions as PopoverActions<TData, TContext, TPopoverKey> & TCustomActions;
  }
  const reservedCoreActionNames: ReadonlySet<string> = new Set(Object.keys(coreActions));
  const mergedActions: Record<string, unknown> = { ...coreActions };
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
