/**
 * Multi-Tab State Synchronization Driver for PopoverTrail.
 * Synchronizes popover actions across multiple open browser tabs using BroadcastChannel.
 */

import type { TabId } from '../types/storeTypes';
import { generateTabId } from './uuid';

export interface PopoverSyncMessage {
  type: 'OPEN' | 'CLOSE' | 'PIN' | 'UNPIN' | 'RESET';
  key?: string;
  timestamp: number;
  tabId: string | TabId;
}

export type PopoverSyncListener = (message: PopoverSyncMessage) => void;

const DISPOSE_SYMBOL: symbol = Symbol.dispose ?? Symbol.for('Symbol.dispose');

/**
 * Creates a tab-sync manager using native BroadcastChannel.
 */
export function createBroadcastSync(channelName = 'popover-trail-sync') {
  const tabId = generateTabId();
  const listeners = new Set<PopoverSyncListener>();
  let channel: BroadcastChannel | null = null;

  let messageHandler: ((event: MessageEvent<PopoverSyncMessage>) => void) | null = null;

  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(channelName);
      messageHandler = (event: MessageEvent<PopoverSyncMessage>) => {
        if (event.data && event.data.tabId !== tabId) {
          for (const listener of listeners) {
            listener(event.data);
          }
        }
      };
      channel.addEventListener('message', messageHandler);
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
      if (messageHandler) {
        channel.removeEventListener('message', messageHandler);
        messageHandler = null;
      }
      channel.close();
      channel = null;
    }
  };

  return {
    tabId,
    broadcast,
    subscribe,
    destroy,
    dispose: destroy,
    [DISPOSE_SYMBOL]: destroy,
  };
}
