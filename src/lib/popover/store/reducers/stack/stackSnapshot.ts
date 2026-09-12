/**
 * History Snapshot State Patch Restoration Reducer for popover-trail.
 *
 * @module store/reducers/stack/stackSnapshot
 */

import type { StatePatch } from '../../../types';
import type { HistorySnapshot } from '../../history';

/**
 * Pure state reducer restoring snapshots and running cleanup over dangling records.
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
