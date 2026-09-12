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

export interface SnapshotChannelHandle {
  channel: BroadcastChannel | null;
  handler: EventListener | null;
}

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

export function closeSnapshotChannel(channel: BroadcastChannel | null): void {
  if (channel) wrapResult(() => channel.close());
}
