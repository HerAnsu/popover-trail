/**
 * Window Storage Event Fallback Driver for Cross-Tab Synchronization.
 *
 * @module store/persistence/storageFallbackBroadcaster
 */

import { safeCallback } from '../../utils/safeCallback';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { safeJsonParse, safeJsonStringify } from './safeJson';
import type { CrossTabBroadcaster } from './persistenceTypes';

/**
 * Creates a cross-tab broadcaster fallback using window storage events.
 */
export function createStorageFallbackDriver(
  channelName: string,
  listeners: Set<(message: unknown) => void>,
): CrossTabBroadcaster {
  let disposed = false;

  const storageHandler = (e: StorageEvent) => {
    if (disposed || e.key !== channelName || !e.newValue) return;
    const data = safeJsonParse(e.newValue);
    if (data !== null) {
      for (const listener of listeners) {
        safeCallback(listener, [data], { contextName: 'CrossTabBroadcaster:storage' });
      }
    }
  };

  window.addEventListener('storage', storageHandler);

  const dispose = () => {
    if (disposed) return;
    disposed = true;
    listeners.clear();
    window.removeEventListener('storage', storageHandler);
  };

  return {
    postMessage: (message: unknown) => {
      if (!disposed) {
        try {
          window.localStorage.setItem(channelName, safeJsonStringify(message));
        } catch {
          // Ignore storage write errors
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
