/**
 * History Snapshot State Patch Restoration Reducer for popover-trail.
 *
 * @module store/reducers/stack/stackSnapshot
 */

import type { StatePatch } from '../../../types';
import type { HistorySnapshot } from '../../history';

/**
 * Pure state reducer restoring snapshots and running cleanup over dangling records.
 *
 * @example
 * ```ts
 * const patch = getSnapshotStatePatch(snapshot);
 * store.setState(patch);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TContext - Ambient context data type.
 * @template TPopoverKey - Valid popover key union.
 * @param snapshot - Immutable history snapshot to restore.
 * @returns State patch resetting active collections to historical state.
 */
export function getSnapshotStatePatch<
  TData,
  TContext = unknown,
  TPopoverKey extends string = string,
>(snapshot: HistorySnapshot<TData, TPopoverKey>): StatePatch<TData, TContext, TPopoverKey> {
  return {
    trail: snapshot.trail,
    floating: snapshot.floating,
    offsets: snapshot.offsets,
    pinnedStates: snapshot.pinnedStates,
    zIndexOrder: snapshot.zIndexOrder,
    ownerId: snapshot.ownerId,
    ...(snapshot.trail.length === 0 ? { anchorElement: null, anchorRect: null } : {}),
  };
}
