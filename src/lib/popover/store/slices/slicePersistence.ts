/**
 * State Persistence & Transaction Domain Action Slice for popover-trail.
 * Encapsulates event subscriptions, key watchers, batching, undo/redo, transactions, and state persistence.
 *
 * @module store/slices/slicePersistence
 */

import type {
  PopoverActions,
  PopoverPersistConfig,
  TrailEntry,
  PopoverStoreEvent,
} from '../../types';
import { findEntryInStore, getSnapshotStatePatch } from '../../utils/storeHelpers';
import { isOk, isErr, wrapResult, wrapAsyncResult } from '../../utils/result';
import { generateTabId } from '../../utils/uuid';
import type { SliceContext } from './sliceContext';
import {
  PERSIST_SCHEMA_VERSION,
  resolveStorageEngine,
  sanitizePersistedOffsets,
  sanitizePersistedEntries,
  safeJsonParse,
  applyRehydratedState,
  executeWithTransition,
  rollbackTransactionState,
  restoreDAGFromState,
} from './persistenceHelpers';

/**
 * Factory creating persistence, batching, transaction, and event bus actions.
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
  const {
    activeControllers,
    eventListeners,
    resetStoreState,
    clearHistory,
    startBatch,
    endBatch,
    middlewareEngine,
    cache,
  } = deps;

  const getCurrentState = () => get();

  return {
    subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => {
      eventListeners.add(listener);
      return () => {
        eventListeners.delete(listener);
      };
    },

    subscribeKey: (
      key: TPopoverKey,
      listener: (
        entry: TrailEntry<TData, TPopoverKey> | undefined,
        prevEntry: TrailEntry<TData, TPopoverKey> | undefined,
      ) => void,
    ): (() => void) => {
      if (!key || typeof listener !== 'function') return () => {};

      let prevEntry = findEntryInStore<TData, TPopoverKey>(get().floating, get().trail, key);

      if (deps.subscribeState) {
        return deps.subscribeState((state, prevState) => {
          // Reference fast-path: updates replace list identities only when
          // their contents change, so equal references imply our entry is
          // unchanged — skip both O(n) lookups entirely.
          if (state.floating === prevState.floating && state.trail === prevState.trail) return;

          const currentEntry = findEntryInStore<TData, TPopoverKey>(
            state.floating,
            state.trail,
            key,
          );
          const oldEntry = findEntryInStore<TData, TPopoverKey>(
            prevState.floating,
            prevState.trail,
            key,
          );

          if (currentEntry !== prevEntry) {
            const lastPrev = prevEntry ?? oldEntry;
            prevEntry = currentEntry;

            const notifyResult = wrapResult(() => listener(currentEntry, lastPrev));
            if (isErr(notifyResult)) {
              console.error(
                `[popover-trail]: Exception in subscribeKey listener for "${key}":`,
                notifyResult.error,
              );
            }
          }
        });
      }

      return () => {};
    },

    batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => {
      startBatch();
      try {
        fn(get().actions);
      } finally {
        endBatch();
      }
    },

    runTransition: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => {
      executeWithTransition(() => {
        fn(get().actions);
      });
    },

    useMiddleware: (middleware: Parameters<typeof middlewareEngine.use>[0]) =>
      middlewareEngine.use(middleware),

    canUndo: () => (deps.historyManager ? deps.historyManager.canUndo() : false),
    canRedo: () => (deps.historyManager ? deps.historyManager.canRedo() : false),

    undo: () => {
      if (deps.historyManager) {
        const prev = deps.historyManager.undo(get());
        if (prev) {
          restoreDAGFromState(deps.popoverDAG, prev.trail, prev.floating);
          set(getSnapshotStatePatch(prev));
        }
      }
    },

    redo: () => {
      if (deps.historyManager) {
        const next = deps.historyManager.redo(get());
        if (next) {
          restoreDAGFromState(deps.popoverDAG, next.trail, next.floating);
          set(getSnapshotStatePatch(next));
        }
      }
    },

    transaction: async (
      fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
    ) => {
      const snapshotState = getCurrentState();
      const snapshotControllers =
        activeControllers.size > 0 ? new Set(activeControllers.keys()) : null;

      const txResult = await wrapAsyncResult(Promise.resolve().then(() => fn(get().actions)));

      if (isErr(txResult)) {
        if (getCurrentState().debug) {
          console.error('[popover-trail]: Transaction Rollback:', txResult.error);
        }
        rollbackTransactionState<TData, TContext, TPopoverKey>(
          snapshotState,
          snapshotControllers,
          activeControllers,
          deps.popoverDAG,
          set,
        );
        return false;
      }

      return true;
    },

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
        tabId: generateTabId(),
        floating: sanitizedFloating,
        offsets: cleanOffsets,
        pinnedStates: cleanPinnedStates,
        zIndexOrder: zIndexOrder.filter((k) => keysToSave.has(k)),
      };

      const serializeResult = wrapResult(() => JSON.stringify(snapshotPayload));
      if (isOk(serializeResult)) {
        wrapResult(() => engine.setItem(storageKey, serializeResult.data));
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
