/**
 * Snapshot Application to Store.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/history/historyApply
 */

import type { HistorySnapshot } from './historyTypes';

export function applyHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  store: { setState?: (patch: unknown) => void } | ((patch: unknown) => void),
  snapshot: HistorySnapshot<TData, TPopoverKey>,
): void {
  const patch = {
    trail: snapshot.trail,
    floating: snapshot.floating,
    offsets: snapshot.offsets,
    pinnedStates: snapshot.pinnedStates,
    zIndexOrder: snapshot.zIndexOrder,
    ownerId: snapshot.ownerId,
  };
  if ('setState' in store && typeof store.setState === 'function') {
    store.setState(patch);
  } else if (typeof store === 'function') {
    store(patch);
  }
}
