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

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

/**
 * Creates a real-time multi-tab state synchronizer using the browser BroadcastChannel API.
 *
 * @remarks
 * Synchronizes popover actions (open, close, pin, reset) across separate browser tabs without server roundtrips.
 * Automatically attaches a unique `tabId` to each message to suppress self-echo feedback loops.
 *
 * @example
 * ```typescript
 * const sync = createBroadcastSync('my-app-popovers');
 *
 * // Broadcast an open action to neighbor tabs
 * sync.broadcast('OPEN', 'userCard');
 *
 * // Listen for events from other tabs
 * const unsubscribe = sync.subscribe((msg) => {
 *   console.log('Received action from tab:', msg.tabId, msg.type);
 * });
 * ```
 *
 * @param channelName - Custom BroadcastChannel name identifier (defaults to 'popover-trail-sync').
 * @returns Sync manager instance with `broadcast`, `subscribe`, and `dispose` methods.
 */
export function createBroadcastSync(channelName = 'popover-trail-sync') {
  const safeChannelName = channelName || 'popover-trail-sync';
  const tabId = generateTabId();
  const listeners = new Set<PopoverSyncListener>();
  let channel: BroadcastChannel | null = null;

  let messageHandler: ((event: MessageEvent<PopoverSyncMessage>) => void) | null = null;

  if (typeof window !== 'undefined' && typeof BroadcastChannel !== 'undefined') {
    try {
      channel = new BroadcastChannel(safeChannelName);
      messageHandler = (event: MessageEvent<PopoverSyncMessage>) => {
        if (event.data && event.data.tabId !== tabId) {
          for (const listener of listeners) {
            try {
              listener(event.data);
            } catch (err) {
              console.error('[BroadcastSync] Error executing listener:', err);
            }
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
