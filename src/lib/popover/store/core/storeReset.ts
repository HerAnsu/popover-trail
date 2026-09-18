/**
 * Store Reset State and Subsystem Teardown Logic.
 *
 * @module storeReset
 */

import type { PopoverDAG } from '../../utils/dag';
import type { PopoverTransitionScheduler } from '../transitionScheduler';
import type { ControllerManager } from '../storeControllers';
import type { HistoryManager } from '../history';
import type { HydrationManager } from '../storeHydration';
import type { SafeSetFn } from './storeSafeSet';
import { getResettableStorePatch } from '../storeDefaults';

/**
 * Bundle of subsystems and dispatchers required to perform a complete store state reset.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface ResetStoreSubsystems<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Asynchronous abort controller manager. */
  readonly controllerManager: ControllerManager<TData, TPopoverKey>;
  /** Transition animation and timer scheduler. */
  readonly transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
  /** Topological Directed Acyclic Graph hierarchy tracker. */
  readonly popoverDAG: PopoverDAG<TPopoverKey>;
  /** Undo/redo history snapshot manager. */
  readonly historyManager: HistoryManager<TData, TPopoverKey>;
  /** Hydration monotonicity counters manager. */
  readonly hydrationManager: HydrationManager;
  /** Safe state patch dispatcher. */
  readonly safeSet: SafeSetFn<TData, TContext, TPopoverKey>;
}

/**
 * Resets store state and clears all active controllers, timers, and DAG nodes.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param subsystems - Bundle of store managers and safeSet function.
 *
 * @example
 * ```typescript
 * executeStoreReset(subsystems);
 * ```
 */
export function executeStoreReset<TData, TContext = unknown, TPopoverKey extends string = string>(
  subsystems: ResetStoreSubsystems<TData, TContext, TPopoverKey>,
): void {
  const {
    controllerManager,
    transitionScheduler,
    popoverDAG,
    historyManager,
    hydrationManager,
    safeSet,
  } = subsystems;

  controllerManager.abortControllersForKeys(controllerManager.activeControllers.keys());
  transitionScheduler.clear();
  popoverDAG.clear();
  historyManager.clearHistory();
  hydrationManager.resetHydrationCounters();

  safeSet(getResettableStorePatch<TPopoverKey>());
}
