/**
 * Store Resource Cleanup and Slice Teardown Runner.
 *
 * @module storeDisposal
 */

import type { StoreApi } from 'zustand/vanilla';
import type { StoreSliceDescriptor, PopoverStore } from '../../types';
import type { PopoverMiddlewareEngine } from '../storeMiddlewareEngine';
import type { PopoverTransitionScheduler } from '../transitionScheduler';
import type { PopoverEventBus } from '../eventBus';
import type { PopoverDAG } from '../../utils/dag';
import type { ControllerManager } from '../storeControllers';
import type { BatchingManager } from '../storeBatching';
import type { ActionRegistryDependencies } from '../storeActionRegistry';
import type { SliceContext } from '../slices/context';
import { wrapResult, isErr } from '../../utils/result';
import { logger } from '../../utils/logger';

export interface StoreDisposalConfig<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TStore extends PopoverStore<TData, TContext, TPopoverKey> = PopoverStore<
    TData,
    TContext,
    TPopoverKey
  >,
> {
  store: StoreApi<TStore>;
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  dependencies: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
  controllerManager: ControllerManager<TData, TPopoverKey>;
  transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
  eventBus: PopoverEventBus<TData, TPopoverKey>;
  eventListeners: Set<unknown>;
  popoverDAG: PopoverDAG<TPopoverKey>;
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  batchingManager: BatchingManager;
  fsmRegistry?: { destroyAll: () => void };
  unbindFSM?: () => void;
}

export function disposeCustomSlices<
  TData,
  TContext,
  TPopoverKey extends string,
  TStore extends PopoverStore<TData, TContext, TPopoverKey> = PopoverStore<
    TData,
    TContext,
    TPopoverKey
  >,
>(
  store: StoreApi<TStore>,
  customSlices: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[],
  deps: ActionRegistryDependencies<TData, TContext, TPopoverKey>,
): void {
  const sliceCtx: SliceContext<TData, TContext, TPopoverKey> = {
    set: (partial, replace) => {
      if (replace) {
        const fullState = typeof partial === 'function' ? partial(store.getState()) : partial;
        store.setState(fullState as TStore, true);
      } else {
        store.setState(partial as Parameters<typeof store.setState>[0]);
      }
    },
    get: store.getState,
    deps,
  };

  for (const slice of customSlices) {
    if (!slice.dispose) continue;
    const res = wrapResult(() => slice.dispose?.(sliceCtx));
    if (isErr(res)) {
      logger.error(`[popover-trail]: Error in slice "${slice.name}" dispose hook:`, res.error);
    }
  }
}

export function runStoreDisposal<
  TData,
  TContext,
  TPopoverKey extends string,
  TStore extends PopoverStore<TData, TContext, TPopoverKey> = PopoverStore<
    TData,
    TContext,
    TPopoverKey
  >,
>(cfg: StoreDisposalConfig<TData, TContext, TPopoverKey, TStore>): void {
  cfg.unbindFSM?.();
  cfg.fsmRegistry?.destroyAll();
  if (cfg.customSlices) disposeCustomSlices(cfg.store, cfg.customSlices, cfg.dependencies);
  cfg.store.getState().destroy();
  cfg.controllerManager.dispose();
  cfg.transitionScheduler.dispose();
  cfg.eventBus.clear();
  cfg.eventListeners.clear();
  cfg.popoverDAG.clear();
  cfg.middlewareEngine.dispose();
  cfg.batchingManager.dispose();
}
