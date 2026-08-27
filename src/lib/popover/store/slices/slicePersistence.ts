/**
 * State Persistence Domain Action Slice for popover-trail.
 * Encapsulates storage persistence, rehydration, and full store teardown.
 *
 * @module store/slices/slicePersistence
 */

import type { PopoverPersistConfig } from '../../types';
import { isOk, wrapResult, wrapAsyncResult } from '../../utils/result';
import { generateTabId } from '../../utils/uuid';
import { serializeJson } from '../persistence/persistenceCore';
import type { SliceContext } from './sliceContext';
import {
  PERSIST_SCHEMA_VERSION,
  resolveStorageEngine,
  sanitizePersistedOffsets,
  sanitizePersistedEntries,
  safeJsonParse,
  applyRehydratedState,
} from './persistenceHelpers';

/**
 * Factory creating persistence actions (`persistState`, `rehydrateState`, `destroy`).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string union.
 * @param ctx - Store dependency injection slice context.
 * @returns Persistence action dispatch methods.
 */
export function createPersistenceSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { activeControllers, eventListeners, resetStoreState, clearHistory, cache } = deps;

  const getCurrentState = () => get();
  // Stable per-store-instance identity: lets cross-tab consumers filter out
  // their own echo instead of minting a fresh id on every save.
  const instanceTabId = generateTabId();

  return {
    persistState: async (config?: PopoverPersistConfig) => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return;

      const { floating, pinnedStates, offsets, zIndexOrder } = getCurrentState();
      const filterFn = config?.filter;

      const filteredFloating = filterFn ? floating.filter((e) => filterFn(e.key)) : floating;
      const keysToSave = new Set<TPopoverKey>(filteredFloating.map((e) => e.key));

      const cleanOffsets = sanitizePersistedOffsets(offsets, keysToSave);
      const cleanPinnedStates: Partial<Record<TPopoverKey, boolean>> = {};

      for (const k of keysToSave) {
        if (pinnedStates[k] !== undefined) {
          cleanPinnedStates[k] = pinnedStates[k];
        }
      }

      const sanitizedFloating = sanitizePersistedEntries(filteredFloating);

      const snapshotPayload = {
        version: PERSIST_SCHEMA_VERSION,
        timestamp: Date.now(),
        tabId: instanceTabId,
        floating: sanitizedFloating,
        offsets: cleanOffsets,
        pinnedStates: cleanPinnedStates,
        zIndexOrder: zIndexOrder.filter((k) => keysToSave.has(k)),
      };

      const raw = serializeJson(snapshotPayload);
      if (raw !== null) {
        wrapResult(() => engine.setItem(storageKey, raw));
      }
    },

    rehydrateState: async (config?: PopoverPersistConfig): Promise<boolean> => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return false;

      const readResult = await wrapAsyncResult(Promise.resolve(engine.getItem(storageKey)));
      if (!isOk(readResult) || typeof readResult.data !== 'string' || !readResult.data)
        return false;

      const parsed = safeJsonParse(readResult.data);
      if (!parsed) {
        if (getCurrentState().debug) {
          console.error('[popover-trail]: Failed to parse rehydration payload.');
        }
        return false;
      }

      return applyRehydratedState<TData, TContext, TPopoverKey>(parsed, set, deps.popoverDAG);
    },

    destroy: () => {
      resetStoreState();
      clearHistory();
      eventListeners.clear();
      cache?.destroy?.();
      const storeCache = get().cache;
      if (storeCache && storeCache !== cache) {
        if (typeof storeCache.destroy === 'function') {
          storeCache.destroy();
        } else if (typeof storeCache.clear === 'function') {
          storeCache.clear();
        }
      }

      if (activeControllers.size > 0) {
        for (const controller of activeControllers.values()) {
          controller.abort();
        }
        activeControllers.clear();
      }

      if (deps.inFlightPromises.size > 0) {
        deps.inFlightPromises.clear();
      }

      deps.transitionScheduler.clear();
      deps.popoverDAG?.clear();
    },
  };
}

export { type StateStorageEngine } from '../../types';
