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

export interface ResetStoreSubsystems<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  controllerManager: ControllerManager<TData, TPopoverKey>;
  transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
  popoverDAG: PopoverDAG<TPopoverKey>;
  historyManager: HistoryManager<TData, TPopoverKey>;
  hydrationManager: HydrationManager;
  safeSet: SafeSetFn<TData, TContext, TPopoverKey>;
}

/**
 * Resets store state and clears all active controllers, timers, and DAG nodes.
 *
 * @example
 * ```ts
 * executeStoreReset(subsystems);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param subsystems - Bundle of store managers and safeSet function.
 */
export function executeStoreReset<TData, TContext = unknown, TPopoverKey extends string = string>(
  subsystems: ResetStoreSubsystems<TData, TContext, TPopoverKey>,
): void {
  subsystems.controllerManager.abortControllersForKeys(
    subsystems.controllerManager.activeControllers.keys(),
  );
  subsystems.transitionScheduler.clear();
  subsystems.popoverDAG.clear();
  subsystems.historyManager.clearHistory();
  subsystems.hydrationManager.resetHydrationCounters();

  subsystems.safeSet(getResettableStorePatch<TPopoverKey>());
}
