/**
 * Store Managers & Infrastructure Registry Initialization.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * Instantiates and encapsulates all headless state orchestration subsystems:
 * async abort controllers, hydration monotonicity counters, directed acyclic graphs (DAG),
 * batch coordinators, transition schedulers, history undo/redo journals, event buses,
 * middleware execution engines, and finite state automaton (FSM) card registries.
 *
 * @module store/core/storeManagers
 */

import type { PopoverStoreEvent, StoreSliceDescriptor } from '../../types';
import { PopoverDAG } from '../../utils/dag';
import { createHistoryManager, type HistoryManager } from '../history';
import { createHydrationManager, type HydrationManager } from '../storeHydration';
import { createControllerManager, type ControllerManager } from '../storeControllers';
import { createBatchingManager, type BatchingManager } from '../storeBatching';
import { PopoverTransitionScheduler } from '../transitionScheduler';
import { PopoverEventBus } from '../eventBus';
import { PopoverMiddlewareEngine } from '../storeMiddlewareEngine';
import { isDevEnv } from '../../validators/warningEngine';
import {
  createPopoverFSMRegistry,
  bindFSMRegistryToEventBus,
  type PopoverFSMRegistry,
} from '../fsm';

/**
 * Composite container bundling all headless infrastructure manager instances.
 */
export interface StoreManagers<TData, TContext, TPopoverKey extends string> {
  /** Asynchronous abort controller manager for cancellation lifecycles. */
  controllerManager: ControllerManager<TData, TPopoverKey>;
  /** Hydration monotonicity and staleness counter manager. */
  hydrationManager: HydrationManager;
  /** Topological hierarchy Directed Acyclic Graph. */
  popoverDAG: PopoverDAG<TPopoverKey>;
  /** Microtask batching and subscription coalescing engine. */
  batchingManager: BatchingManager;
  /** Exit and enter transition duration coordinator. */
  transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
  /** Bounded ring buffer journal for undo/redo state replay. */
  historyManager: HistoryManager<TData, TPopoverKey, TContext>;
  /** Registered external event listener callbacks set. */
  eventListeners: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
  /** High-performance decoupled popover event bus. */
  eventBus: PopoverEventBus<TData, TPopoverKey>;
  /** Interceptor pipeline for state mutations. */
  middlewareEngine: PopoverMiddlewareEngine<TData, TContext, TPopoverKey>;
  /** Finite state machine registry for per-card lifecycles. */
  fsmRegistry: PopoverFSMRegistry<TData, TPopoverKey>;
  /** Teardown listener unbinding the FSM registry from the event bus. */
  unbindFSM: () => void;
}

/**
 * Instantiates and wires all headless store managers and registry infrastructure.
 *
 * @param customSlices - Optional list of user-provided custom slices with middleware hooks.
 * @returns Fully initialized StoreManagers bundle.
 */
export function initStoreManagers<TData, TContext, TPopoverKey extends string>(
  customSlices?: readonly StoreSliceDescriptor<object, object, TData, TContext, TPopoverKey>[],
): StoreManagers<TData, TContext, TPopoverKey> {
  const middlewareEngine = new PopoverMiddlewareEngine<TData, TContext, TPopoverKey>();
  if (customSlices) {
    for (const slice of customSlices) if (slice.middleware) middlewareEngine.use(slice.middleware);
  }

  const eventBus = new PopoverEventBus<TData, TPopoverKey>();
  const fsmRegistry = createPopoverFSMRegistry<TData, TPopoverKey>({ isDev: isDevEnv() });
  const unbindFSM = bindFSMRegistryToEventBus(fsmRegistry, eventBus);

  return {
    controllerManager: createControllerManager<TData, TPopoverKey>(),
    hydrationManager: createHydrationManager(),
    popoverDAG: new PopoverDAG<TPopoverKey>(),
    batchingManager: createBatchingManager(),
    transitionScheduler: new PopoverTransitionScheduler<TPopoverKey>(),
    historyManager: createHistoryManager<TData, TPopoverKey, TContext>(30),
    eventListeners: new Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>(),
    eventBus,
    middlewareEngine,
    fsmRegistry,
    unbindFSM,
  };
}
