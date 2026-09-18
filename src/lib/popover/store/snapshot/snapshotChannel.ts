/**
 * Platform BroadcastChannel Adapter for Snapshot Manager.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module snapshotChannel
 */

import { wrapResult, isOk } from '../../utils/result';
import { safeCallback } from '../../utils/safeCallback';
import { isMessageEvent } from '../../utils/guards/domGuards';
import type { PopoverSnapshotData } from './snapshotManagerTypes';
import { isSnapshotRestoreMessage } from './snapshotGuards';

/**
 * Handle wrapping an initialized BroadcastChannel and its bound event listener.
 */
export interface SnapshotChannelHandle {
  /** Underlying BroadcastChannel or `null` if unsupported or failed. */
  channel: BroadcastChannel | null;
  /** Active DOM event listener or `null`. */
  handler: EventListener | null;
}

/**
 * Initializes a multi-tab BroadcastChannel for popover snapshot synchronization.
 *
 * @template TData - Popover payload data type.
 * @param key - Storage key used to identify the BroadcastChannel channel name.
 * @param tabId - Unique identifier of the local browser tab.
 * @param onSnapshotRestored - Callback fired when a snapshot is received from an external tab.
 * @returns Channel handle containing the channel and message listener.
 *
 * @example
 * ```typescript
 * const handle = initSnapshotChannel('my_key', 'tab-1', (snap) => console.log(snap));
 * ```
 */
export function initSnapshotChannel<TData>(
  key: string,
  tabId: string,
  onSnapshotRestored?: (snapshot: PopoverSnapshotData<TData>) => void,
): SnapshotChannelHandle {
  if (typeof BroadcastChannel === 'undefined') return { channel: null, handler: null };
  const res = wrapResult(() => new BroadcastChannel(`${key}_channel`));
  if (!isOk(res)) return { channel: null, handler: null };
  const channel = res.data;
  const handler: EventListener = (event: Event) => {
    if (!isMessageEvent(event)) return;
    const { data } = event;
    if (
      isSnapshotRestoreMessage<TData>(data) &&
      data.snapshot.tabId !== tabId &&
      onSnapshotRestored
    ) {
      safeCallback(onSnapshotRestored, [data.snapshot], { contextName: 'onSnapshotRestored' });
    }
  };
  channel.addEventListener('message', handler);
  return { channel, handler };
}

/**
 * Closes an active BroadcastChannel instance safely.
 *
 * @param channel - BroadcastChannel instance to close.
 *
 * @example
 * ```typescript
 * closeSnapshotChannel(handle.channel);
 * ```
 */
export function closeSnapshotChannel(channel: BroadcastChannel | null): void {
  if (channel) wrapResult(() => channel.close());
}
