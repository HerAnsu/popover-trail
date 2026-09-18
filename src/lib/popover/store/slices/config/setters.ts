/**
 * Factory and Action Creators for Generic Popover State Setters.
 *
 * @module store/slices/config/setters
 */

import type {
  CollisionConfig,
  ConfigSliceSetters,
  PopoverResolver,
  PopoverSlotComponents,
  ZIndexBaseMap,
} from '../../../types';
import { isDeepEqual } from '../../../utils/storeHelpers';
import { isCollisionConfigEqual } from '../../../utils/equality';
import type { ConfigSliceContext } from '../context';
import { createBasicConfigSetters } from './settersBasic';

/**
 * Creates dynamic property setter actions for store configuration state.
 *
 * @example
 * ```ts
 * const setters = createConfigSetters(sliceContext);
 * setters.setContext({ theme: 'dark' });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors and dependencies.
 * @returns Object providing configuration setters.
 */
export function createConfigSetters<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: ConfigSliceContext<TData, TContext, TPopoverKey>,
): ConfigSliceSetters<TData, TContext, TPopoverKey> {
  const { set, get, deps } = ctx;
  const basicSetters = createBasicConfigSetters(ctx);

  return {
    ...basicSetters,
    setContext: (nextContext: TContext) => {
      const { context } = get();
      if (context !== nextContext && !isDeepEqual(context, nextContext)) {
        set({ context: nextContext });
      }
    },
    setResolveData: (newResolver: PopoverResolver<TData, TContext>) => {
      const { resolveData } = get();
      if (resolveData !== newResolver) {
        const { abortAllControllers, inFlightPromises, markAllCountersStale } = deps;
        abortAllControllers?.();
        inFlightPromises?.clear();
        markAllCountersStale?.();
        set({ resolveData: newResolver });
      }
    },
    setCollisionConfig: (config: CollisionConfig | null) => {
      const { collisionConfig } = get();
      if (collisionConfig !== config && !isCollisionConfigEqual(collisionConfig, config)) {
        set({ collisionConfig: config });
      }
    },
    setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => {
      const { mountingClassName, unmountingClassName, mountedClassName } = get();
      if (
        mountingClassName !== mounting ||
        unmountingClassName !== unmounting ||
        mountedClassName !== mounted
      ) {
        set({
          mountingClassName: mounting,
          unmountingClassName: unmounting,
          mountedClassName: mounted,
        });
      }
    },
    setSlotComponents: (components: PopoverSlotComponents | null) => {
      const { components: currentComponents } = get();
      if (currentComponents === components || isDeepEqual(currentComponents, components)) return;
      set({ components });
    },
    setZIndexBaseMap: (zIndexBaseMap: ZIndexBaseMap | null) => {
      const { zIndexBaseMap: currentMap } = get();
      if (currentMap === zIndexBaseMap || isDeepEqual(currentMap, zIndexBaseMap)) return;
      set({ zIndexBaseMap });
    },
  };
}
