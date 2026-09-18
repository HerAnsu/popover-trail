/**
 * Configuration & Display Domain Action Slice for popover-trail.
 * Encapsulates global configuration setters, button controls, lifecycle states, and hover intent.
 *
 * @module store/slices/config/createConfigSlice
 */

import type { ConfigSliceActions, PopoverStateData } from '../../../types';
import { isCollisionConfigEqual } from '../../../utils/equality';
import { isDeepEqual } from '../../../utils/storeHelpers';
import type { ConfigSliceContext } from '../context';
import { createHoverSlice } from './hover';
import { createLifecycleSlice } from './lifecycle';
import { createControlsSlice } from './controls';
import { createConfigSetters } from './setters';

/**
 * Creates the Configuration & Display sub-slice.
 *
 * @example
 * ```ts
 * const configSlice = createConfigSlice(sliceContext);
 * configSlice.setDebug(true);
 * configSlice.updateConfig({ defaultOffset: 12 });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors and dependencies.
 * @returns Combined configuration, hover, lifecycle, and display actions.
 */
export function createConfigSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): ConfigSliceActions<TData, TContext, TPopoverKey> {
  const { set, get, deps } = ctx;
  const hoverSlice = createHoverSlice(ctx);
  const lifecycleSlice = createLifecycleSlice(ctx);
  const controlsSlice = createControlsSlice(ctx);
  const setters = createConfigSetters(ctx);

  return {
    ...hoverSlice,
    ...lifecycleSlice,
    ...controlsSlice,
    ...setters,

    updateConfig: (patch) => {
      const current = get();
      const diff: Partial<PopoverStateData<TData, TContext, TPopoverKey>> = {};
      let hasChanges = false;
      const keys = Object.keys(patch) as (keyof PopoverStateData<TData, TContext, TPopoverKey>)[];

      for (const key of keys) {
        const nextVal = patch[key];
        const curVal = current[key];
        if (curVal === nextVal) continue;

        if (key === 'collisionConfig') {
          if (isCollisionConfigEqual(current.collisionConfig, patch.collisionConfig)) continue;
        } else if (
          (key === 'context' || key === 'components' || key === 'zIndexBaseMap') &&
          isDeepEqual(curVal, nextVal)
        ) {
          continue;
        }

        if (key === 'resolveData') {
          const { abortAllControllers, inFlightPromises, markAllCountersStale } = deps;
          abortAllControllers?.();
          inFlightPromises?.clear();
          markAllCountersStale?.();
        }

        Reflect.set(diff, key, nextVal);
        hasChanges = true;
      }

      if (hasChanges) set(diff);
    },
  };
}
