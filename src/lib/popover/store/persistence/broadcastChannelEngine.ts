/**
 * Native BroadcastChannel Driver for Cross-Tab Synchronization.
 *
 * @module store/persistence/broadcastChannelEngine
 */

import { safeCallback } from '../../utils/safeCallback';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import type { CrossTabBroadcaster } from './persistenceTypes';

/**
 * Creates a cross-tab broadcaster using the modern BroadcastChannel API.
 */
export function createBroadcastChannelDriver(
  channelName: string,
  listeners: Set<(message: unknown) => void>,
): CrossTabBroadcaster {
  let channel: BroadcastChannel | null = new BroadcastChannel(channelName);
  let disposed = false;

  const messageHandler = (event: MessageEvent) => {
    if (disposed) return;
    for (const listener of listeners) {
      safeCallback(listener, [event.data], { contextName: 'CrossTabBroadcaster' });
    }
  };
  channel.addEventListener('message', messageHandler);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    listeners.clear();
    channel?.removeEventListener('message', messageHandler);
    channel?.close();
    channel = null;
  };

  return {
    postMessage: (message: unknown) => {
      if (!disposed && channel) {
        try {
          channel.postMessage(message);
        } catch {
          // Ignore serialization or broadcast errors
        }
      }
    },
    onMessage: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    dispose,
    [DISPOSE_SYMBOL]: dispose,
  };
}
