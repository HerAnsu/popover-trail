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
    setContext: (context: TContext) => {
      if (get().context !== context && !isDeepEqual(get().context, context)) {
        set({ context });
      }
    },
    setResolveData: (newResolver: PopoverResolver<TData, TContext>) => {
      if (get().resolveData !== newResolver) {
        deps.abortAllControllers?.();
        if (deps.inFlightPromises && deps.inFlightPromises.size > 0) {
          deps.inFlightPromises.clear();
        }
        deps.markAllCountersStale?.();
        set({ resolveData: newResolver });
      }
    },
    setCollisionConfig: (config: CollisionConfig | null) => {
      if (
        get().collisionConfig !== config &&
        !isCollisionConfigEqual(get().collisionConfig, config)
      ) {
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
      if (get().components === components || isDeepEqual(get().components, components)) return;
      set({ components });
    },
    setZIndexBaseMap: (zIndexBaseMap: ZIndexBaseMap | null) => {
      if (
        get().zIndexBaseMap === zIndexBaseMap ||
        isDeepEqual(get().zIndexBaseMap, zIndexBaseMap)
      ) {
        return;
      }
      set({ zIndexBaseMap });
    },
  };
}
