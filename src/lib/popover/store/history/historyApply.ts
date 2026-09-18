/**
 * Snapshot Application to Store.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module store/history/historyApply
 */

import type { HistorySnapshot } from './historyTypes';

/**
 * Applies a serialized history state snapshot to a Zustand store or state dispatcher.
 *
 * @remarks
 * Dispatches an atomic patch containing trail hierarchy, floating popovers, drag offsets,
 * pinned states, z-index stacking order, and owner identifier.
 *
 * @template TData - Type of data payload associated with popover entries.
 * @template TPopoverKey - Branded or string type of popover key identifiers.
 * @param store - Target Zustand store instance with `setState`, or standalone state dispatcher.
 * @param snapshot - History snapshot to restore.
 *
 * @example
 * ```typescript
 * applyHistorySnapshot(store, previousSnapshot);
 * ```
 */
export function applyHistorySnapshot<TData = unknown, TPopoverKey extends string = string>(
  store: { setState?: (patch: unknown) => void } | ((patch: unknown) => void),
  snapshot: HistorySnapshot<TData, TPopoverKey>,
): void {
  const { trail, floating, offsets, pinnedStates, zIndexOrder, ownerId } = snapshot;
  const patch = { trail, floating, offsets, pinnedStates, zIndexOrder, ownerId };
  if ('setState' in store && typeof store.setState === 'function') {
    store.setState(patch);
  } else if (typeof store === 'function') {
    store(patch);
  }
}
