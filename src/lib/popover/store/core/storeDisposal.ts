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

/**
 * Configuration of store subsystems and managers required to perform resource disposal.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TStore - Popover store type.
 */
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
  /** Zustand store instance. */
  readonly store: StoreApi<TStore>;
  /** Optional custom slice descriptors. */
  readonly customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[];
  /** Unified action registry dependencies. */
  readonly dependencies: ActionRegistryDependencies<TData, TContext, TPopoverKey>;
  /** Controller manager. */
  readonly controllerManager: ControllerManager<TData, TPopoverKey>;
  /** Transition scheduler. */
  readonly transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
  /** Decoupled popover event bus. */
  readonly eventBus: PopoverEventBus<TData, TPopoverKey>;
  /** External registered event listeners set. */
  readonly eventListeners: Set<unknown>;
  /** Directed acyclic graph instance. */
  readonly popoverDAG: PopoverDAG<TPopoverKey>;
  /** Middleware interceptor engine. */
  readonly middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  /** Batching and microtask coalescing manager. */
  readonly batchingManager: BatchingManager;
  /** Optional FSM registry instance. */
  readonly fsmRegistry?: { destroyAll: () => void };
  /** Optional FSM event bus unbinder. */
  readonly unbindFSM?: () => void;
}

/**
 * Invokes the `dispose` lifecycle hook on all registered custom slices.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TStore - Popover store type.
 * @param store - Store API instance.
 * @param customSlices - Registered custom slice descriptors.
 * @param deps - Action registry dependencies.
 *
 * @example
 * ```typescript
 * disposeCustomSlices(store, slices, dependencies);
 * ```
 */
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

  for (const { dispose, name } of customSlices) {
    if (!dispose) continue;
    const res = wrapResult(() => dispose(sliceCtx));
    if (isErr(res)) {
      logger.error(`[popover-trail]: Error in slice "${name}" dispose hook:`, res.error);
    }
  }
}

/**
 * Disposes all store subsystems, active abort controllers, timers, and custom slice resources.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @template TStore - Popover store type.
 * @param cfg - Disposal configuration object containing subsystems to dismantle.
 *
 * @example
 * ```typescript
 * runStoreDisposal(config);
 * ```
 */
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
  const {
    unbindFSM,
    fsmRegistry,
    customSlices,
    store,
    dependencies,
    controllerManager,
    transitionScheduler,
    eventBus,
    eventListeners,
    popoverDAG,
    middlewareEngine,
    batchingManager,
  } = cfg;

  unbindFSM?.();
  fsmRegistry?.destroyAll();
  if (customSlices) disposeCustomSlices(store, customSlices, dependencies);
  store.getState().destroy();
  controllerManager.dispose();
  transitionScheduler.dispose();
  eventBus.clear();
  eventListeners.clear();
  popoverDAG.clear();
  middlewareEngine.dispose();
  batchingManager.dispose();
}
