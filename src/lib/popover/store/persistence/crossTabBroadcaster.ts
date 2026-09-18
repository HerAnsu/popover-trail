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
 * Creates a `CrossTabBroadcaster` instance for synchronizing popover state changes across browser tabs.
 * Prefers the modern native `BroadcastChannel` API and falls back gracefully to `StorageEvent`
 * or a no-op implementation in non-browser/restricted environments.
 *
 * @param channelName - Unique communication channel identifier (defaults to `'popover_trail_sync'`).
 * @returns Initialized `CrossTabBroadcaster` implementing message posting and disposal.
 *
 * @example
 * ```typescript
 * const broadcaster = createCrossTabBroadcaster('my_app_popovers');
 *
 * broadcaster.onMessage((msg) => {
 *   console.log('Received cross-tab message:', msg);
 * });
 *
 * broadcaster.postMessage({ type: 'sync' });
 * ```
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
