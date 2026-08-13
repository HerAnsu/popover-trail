/**
 * State Persistence & Transaction Domain Action Slice for popover-trail.
 * Encapsulates event subscriptions, batching, undo/redo time travel, transactions, and state persistence.
 *
 * @module slicePersistence
 */

import type {
  PopoverActions,
  PopoverPersistConfig,
  TrailEntry,
  PopoverStoreEvent,
} from '../../types';
import { getSnapshotStatePatch } from '../../utils/storeHelpers';
import type { SliceContext } from './sliceContext';

function resolveStorageEngine(config?: PopoverPersistConfig) {
  const storageKey = config?.storageKey ?? config?.key ?? 'popover_store_state';
  const engine =
    config?.storage ??
    (typeof window !== 'undefined' && window.localStorage ? window.localStorage : null);
  return { storageKey, engine };
}

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

    batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => {
      startBatch();
      try {
        fn(get().actions);
      } finally {
        endBatch();
      }
    },

    useMiddleware: (middleware: Parameters<typeof middlewareEngine.use>[0]) =>
      middlewareEngine.use(middleware),

    canUndo: () => (deps.historyManager ? deps.historyManager.canUndo() : false),
    canRedo: () => (deps.historyManager ? deps.historyManager.canRedo() : false),

    undo: () => {
      if (deps.historyManager) {
        const prev = deps.historyManager.undo(get());
        if (prev) set(getSnapshotStatePatch(prev));
      }
    },
    redo: () => {
      if (deps.historyManager) {
        const next = deps.historyManager.redo(get());
        if (next) set(getSnapshotStatePatch(next));
      }
    },

    transaction: async (
      fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
    ) => {
      const snapshotState = getCurrentState();
      const snapshotControllers =
        activeControllers.size > 0 ? new Set(activeControllers.keys()) : null;
      try {
        await fn(get().actions);
        return true;
      } catch (err) {
        if (getCurrentState().debug) {
          console.error('Popover Transaction Rollback:', err);
        }
        if (activeControllers.size > 0) {
          for (const key of activeControllers.keys()) {
            if (!snapshotControllers || !snapshotControllers.has(key)) {
              const controller = activeControllers.get(key);
              if (controller) controller.abort();
              activeControllers.delete(key);
            }
          }
        }
        if (deps.popoverDAG) {
          deps.popoverDAG.clear();
          for (const entry of snapshotState.trail) {
            deps.popoverDAG.addNode(entry.key, entry.parentKey);
          }
          for (const entry of snapshotState.floating) {
            deps.popoverDAG.addNode(entry.key, entry.parentKey);
          }
        }
        set({
          trail: snapshotState.trail,
          floating: snapshotState.floating,
          offsets: snapshotState.offsets,
          pinnedStates: snapshotState.pinnedStates,
          zIndexOrder: snapshotState.zIndexOrder,
          ownerId: snapshotState.ownerId,
          anchorElement: snapshotState.anchorElement,
          anchorRect: snapshotState.anchorRect,
          nestedHydrationRequestCounters: snapshotState.nestedHydrationRequestCounters,
        });
        return false;
      }
    },

    persistState: async (config?: PopoverPersistConfig) => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return;

      const { floating, pinnedStates, offsets, zIndexOrder } = getCurrentState();
      const filterFn = config?.filter;

      const filteredFloating = filterFn ? floating.filter((e) => filterFn(e.key)) : floating;
      if (filteredFloating.length === 0) {
        await engine.setItem(
          storageKey,
          JSON.stringify({ floating: [], offsets: {}, pinnedStates: {}, zIndexOrder: [] }),
        );
        return;
      }
      const keysToSave = new Set(filteredFloating.map((e) => e.key));

      const savedOffsets: Record<string, { x: number; y: number }> = {};
      const savedPinnedStates: Record<string, boolean> = {};

      for (const k of keysToSave) {
        const offsetVal = offsets[k];
        if (offsetVal) savedOffsets[k] = offsetVal;
        const pinnedVal = pinnedStates[k];
        if (pinnedVal !== undefined) savedPinnedStates[k] = pinnedVal;
      }

      const sanitizedFloating = filteredFloating.map((entry) => {
        const clean: Record<string, unknown> = {};
        for (const key of Object.keys(entry)) {
          const val = (entry as Record<string, unknown>)[key];
          if (typeof val !== 'function' && key !== 'dataPromise') {
            clean[key] = val;
          }
        }
        return clean;
      });

      const payload = JSON.stringify({
        floating: sanitizedFloating,
        offsets: savedOffsets,
        pinnedStates: savedPinnedStates,
        zIndexOrder: zIndexOrder.filter((k) => keysToSave.has(k)),
      });
      await engine.setItem(storageKey, payload);
    },

    rehydrateState: async (config?: PopoverPersistConfig) => {
      const { storageKey, engine } = resolveStorageEngine(config);
      if (!engine) return false;

      try {
        const raw = await engine.getItem(storageKey);
        if (!raw) return false;
        const parsed = JSON.parse(raw);
        if (!parsed || !Array.isArray(parsed.floating)) return false;

        const isRawEntry = (item: unknown): item is TrailEntry<TData> =>
          typeof item === 'object' &&
          item !== null &&
          typeof (item as Record<string, unknown>).key === 'string' &&
          !['__proto__', 'constructor', 'prototype'].includes(
            (item as Record<string, unknown>).key as string,
          );

        const nextFloating: TrailEntry<TData>[] = (parsed.floating as unknown[]).flatMap((item) =>
          isRawEntry(item)
            ? [
                {
                  ...item,
                  status: 'success' as const,
                  isLoading: false,
                  error: null,
                  isPinned: true,
                  transitionStatus: 'mounted' as const,
                },
              ]
            : [],
        );

        set({
          floating: nextFloating,
          offsets: parsed.offsets ?? {},
          pinnedStates: parsed.pinnedStates ?? {},
          zIndexOrder: parsed.zIndexOrder ?? [],
        });
        return true;
      } catch (err) {
        if (getCurrentState().debug) {
          console.error('Popover Rehydration Error:', err);
        }
        return false;
      }
    },

    destroy: () => {
      resetStoreState();
      clearHistory();
      eventListeners.clear();
      cache?.destroy?.();
    },
  };
}
