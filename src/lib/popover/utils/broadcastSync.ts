/**
 * Multi-Tab State Synchronization Driver for PopoverTrail.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/broadcastSync
 */

import type { TabId } from '../types/storeTypes';
import { generateTabId } from './uuid';
import { type ScopeDisposable, DISPOSE_SYMBOL } from './disposable';
import { wrapResult, isOk, isErr } from './result';
import { logger } from './logger';
import { isBroadcastChannelSupported } from './guards/envGuards';
import { type PopoverSyncMessage, isPopoverSyncMessage } from './guards/syncGuards';

export type { PopoverSyncMessage };
export type PopoverSyncListener = (message: PopoverSyncMessage) => void;

export interface BroadcastSyncManager extends ScopeDisposable {
  readonly tabId: string | TabId;
  broadcast: (type: PopoverSyncMessage['type'], key?: string) => void;
  subscribe: (listener: PopoverSyncListener) => () => void;
  destroy: () => void;
  [DISPOSE_SYMBOL]: () => void;
}

export function createBroadcastSync(channelName = 'popover-trail-sync'): BroadcastSyncManager {
  const safeChannelName = channelName || 'popover-trail-sync';
  const tabId = generateTabId();
  const listeners = new Set<PopoverSyncListener>();
  let channel: BroadcastChannel | null = null;
  let messageHandler: ((event: MessageEvent<unknown>) => void) | null = null;

  if (isBroadcastChannelSupported()) {
    const channelResult = wrapResult(() => new BroadcastChannel(safeChannelName));
    if (isOk(channelResult)) {
      channel = channelResult.data;
      messageHandler = (event: MessageEvent<unknown>) => {
        if (!isPopoverSyncMessage(event.data) || event.data.tabId === tabId) return;
        const msg = event.data;
        for (const listener of listeners) {
          const listenerResult = wrapResult(() => listener(msg));
          if (isErr(listenerResult)) {
            logger.error('[BroadcastSync] Error executing listener:', listenerResult.error);
          }
        }
      };
      channel.addEventListener('message', messageHandler);
    }
  }

  const broadcast = (type: PopoverSyncMessage['type'], key?: string) => {
    if (!channel) return;
    wrapResult(() => {
      channel?.postMessage({ type, key, timestamp: Date.now(), tabId });
    });
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
