import type { HistorySnapshot } from '../history';
import type { PopoverDAG } from '../../utils/dag';
import type { PopoverStateData, StatePatch } from '../../types';
import { getSnapshotStatePatch } from '../reducers/stack';
import { restoreDAGFromState } from '../persistence/persistenceHelpers';

export function applyHistorySnapshot<TData, TContext, TPopoverKey extends string = string>(
  snapshot: HistorySnapshot<TData, TPopoverKey>,
  popoverDAG: PopoverDAG<TPopoverKey> | undefined,
  set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
): void {
  const { trail, floating } = snapshot;
  restoreDAGFromState(popoverDAG, trail, floating);
  set(getSnapshotStatePatch<TData, TContext, TPopoverKey>(snapshot));
}

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
