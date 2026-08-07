/**
 * Multi-Tab State Synchronization Driver for PopoverTrail.
 * Synchronizes popover actions across multiple open browser tabs using BroadcastChannel.
 */

import type { TabId } from '../types/storeTypes';

export interface PopoverSyncMessage {
  type: 'OPEN' | 'CLOSE' | 'PIN' | 'UNPIN' | 'RESET';
  key?: string;
  timestamp: number;
  tabId: string | TabId;
}

export type PopoverSyncListener = (message: PopoverSyncMessage) => void;

/**
 * Creates a tab-sync manager using native BroadcastChannel.
 */
export function createBroadcastSync(channelName = 'popover-trail-sync') {
  const tabId =
    typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9);
  const listeners = new Set<PopoverSyncListener>();
  let channel: BroadcastChannel | null = null;

  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(channelName);
      channel.addEventListener('message', (event: MessageEvent<PopoverSyncMessage>) => {
        if (event.data && event.data.tabId !== tabId) {
          for (const listener of listeners) {
            listener(event.data);
          }
        }
      });
    } catch {
      // Ignore if BroadcastChannel restricted by browser policy
    }
  }

  const broadcast = (type: PopoverSyncMessage['type'], key?: string) => {
    if (!channel) return;
    try {
      channel.postMessage({
        type,
        key,
        timestamp: Date.now(),
        tabId,
      });
    } catch {
      // Ignore postMessage failure
    }
  };

  const subscribe = (listener: PopoverSyncListener): (() => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    listeners.clear();
    if (channel) {
      channel.close();
      channel = null;
    }
  };

  return {
    tabId,
    broadcast,
    subscribe,
    destroy,
  };
}
