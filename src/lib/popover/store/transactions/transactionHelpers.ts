import type { HistorySnapshot } from '../history';
import type { PopoverDAG } from '../../utils/dag';
import type { PopoverStateData, StatePatch } from '../../types';
import { getSnapshotStatePatch } from '../reducers';
import { restoreDAGFromState } from '../persistence';

/**
 * Applies a history snapshot to the store, restoring DAG graph relationships and state patch.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param snapshot - The history snapshot being restored.
 * @param popoverDAG - Popover DAG instance.
 * @param set - Store update function.
 *
 * @example
 * ```typescript
 * applyHistorySnapshot(snapshot, dag, set);
 * ```
 */
export function applyHistorySnapshot<TData, TContext, TPopoverKey extends string = string>(
  snapshot: HistorySnapshot<TData, TPopoverKey>,
  popoverDAG: PopoverDAG<TPopoverKey> | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void {
  const { trail, floating } = snapshot;
  restoreDAGFromState(popoverDAG, trail, floating);
  set(getSnapshotStatePatch<TData, TContext, TPopoverKey>(snapshot));
}

/**
 * Aborts and removes any active AbortController that was spawned after the snapshot baseline.
 *
 * @param activeControllers - Map of currently active request abort controllers.
 * @param snapshotControllers - Set of controller keys that were alive at transaction start.
 *
 * @example
 * ```typescript
 * rollbackControllers(activeControllers, baselineKeys);
 * ```
 */
export function rollbackControllers(
  activeControllers: Map<string, AbortController>,
  snapshotControllers: ReadonlySet<string> | null,
): void {
  if (!snapshotControllers || activeControllers.size === 0) return;
  for (const [key, controller] of activeControllers) {
    if (!snapshotControllers.has(key)) {
      controller.abort();
      activeControllers.delete(key);
    }
  }
}

/**
 * Rolls back the store state and DAG hierarchy to the provided baseline snapshot.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 * @param snapshot - Baseline state snapshot to restore.
 * @param popoverDAG - Popover DAG instance.
 * @param set - Store update function.
 *
 * @example
 * ```typescript
 * rollbackTransactionState(initialSnapshot, dag, set);
 * ```
 */
export function rollbackTransactionState<TData, TContext, TPopoverKey extends string = string>(
  snapshot: PopoverStateData<TData, TContext, TPopoverKey>,
  popoverDAG: PopoverDAG<TPopoverKey> | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void {
  const {
    trail,
    floating,
    offsets,
    pinnedStates,
    zIndexOrder,
    ownerId,
    anchorElement,
    anchorRect,
    nestedHydrationRequestCounters,
  } = snapshot;

  restoreDAGFromState(popoverDAG, trail, floating);
  set({
    trail,
    floating,
    offsets,
    pinnedStates,
    zIndexOrder,
    ownerId,
    anchorElement,
    anchorRect,
    nestedHydrationRequestCounters,
  });
}
