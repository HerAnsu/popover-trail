/**
 * Cross-Tab Synchronization Broadcaster Factory for popover-trail.
 *
 * @module store/persistence/crossTabBroadcaster
 */

import type { CrossTabBroadcaster } from './persistenceTypes';
import { DISPOSE_SYMBOL } from '../../utils/disposable';
import { isBrowser } from '../../utils/typeGuards';
import { constant, noop } from '../../utils/functional';
import { createBroadcastChannelDriver } from './broadcastChannelEngine';
import { createStorageFallbackDriver } from './storageFallbackBroadcaster';

export type { CrossTabBroadcaster } from './persistenceTypes';

const NOOP_BROADCASTER: CrossTabBroadcaster = Object.freeze({
  postMessage: noop,
  onMessage: constant(noop),
  dispose: noop,
  [DISPOSE_SYMBOL]: noop,
  [Symbol.dispose]: noop,
});

/**
 * Creates a CrossTabBroadcaster instance using BroadcastChannel or StorageEvent fallback.
 */
export function createCrossTabBroadcaster(channelName = 'popover_trail_sync'): CrossTabBroadcaster {
  if (!isBrowser()) {
    return NOOP_BROADCASTER;
  }

  const listeners = new Set<(message: unknown) => void>();

  if (typeof BroadcastChannel !== 'undefined') {
    try {
      return createBroadcastChannelDriver(channelName, listeners);
    } catch {
      // Fallback to storage event if BroadcastChannel creation fails (e.g. in restricted sandboxes)
    }
  }

  try {
    return createStorageFallbackDriver(channelName, listeners);
  } catch {
    return NOOP_BROADCASTER;
  }
}
