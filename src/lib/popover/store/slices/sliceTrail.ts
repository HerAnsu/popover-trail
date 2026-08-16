/**
 * Trail Stack Domain Action Slice for popover-trail.
 * Encapsulates trail stack navigation actions (openRoot, pushNested, closeFrom, closeByKey, closeAll, clearTrail, closeTopmost).
 *
 * @module sliceTrail
 */

import type { TrailEntry, PopoverStoreEvent, PopoverStore } from '../../types';
import {
  openRootState,
  pushNestedState,
  getCleanupStatePatch,
  getRemovedKeysForClose,
  findEntryInStore,
  findEntryIndex,
} from '../../utils/storeHelpers';
import { selectTopmostEntry } from '../storeSelectors';
import { EMPTY_ARRAY } from '../storeDefaults';
import { dispatchStoreEvent } from '../eventBus';
import type { SliceContext } from './sliceContext';
import type { PopoverDAG } from '../../utils/dag';

/**
 * Safely removes nodes from the DAG kernel if they are no longer active
 * in either trailing or floating lists, preventing unbounded graph growth.
 */
function pruneDAGNodes<TData>(
  dag: PopoverDAG | undefined,
  keysToPrune: Iterable<string>,
  remainingFloating: readonly TrailEntry<TData>[],
  remainingTrail: readonly TrailEntry<TData>[] = [],
): void {
  if (!dag) return;

  const floatingSet = new Set(remainingFloating.map((e) => e.key));
  const trailSet = new Set(remainingTrail.map((e) => e.key));

  for (const key of keysToPrune) {
    if (!floatingSet.has(key) && !trailSet.has(key)) {
      dag.removeNode(key);
    }
  }
}

/**
 * Safely executes user onClose lifecycle callbacks and clears DAG node memory for pruned entries.
 */
function notifyAndPruneClosedEntries<TData>(
  removedKeys: ReadonlySet<string>,
  nextFloating: readonly TrailEntry<TData>[],
  nextTrail: readonly TrailEntry<TData>[],
  nextPinnedStates: Record<string, boolean>,
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined,
  dag?: PopoverDAG,
): void {
  const floatingSet = new Set(nextFloating.map((e) => e.key));
  const trailSet = new Set(nextTrail.map((e) => e.key));

  for (const key of removedKeys) {
    const isStillActive = floatingSet.has(key) || trailSet.has(key);
    if (!isStillActive) {
      nextPinnedStates[key] = false;
      dag?.removeNode(key);

      const removedEntry = findEntryByKey(key);
      if (removedEntry?.onClose) {
        try {
          removedEntry.onClose(key);
        } catch (err) {
          console.error('[popover-trail]: Exception in onClose callback:', err);
        }
      }
    }
  }
}

/**
 * Calculates the maximum exit transition duration across all removed keys,
 * taking per-entry duration overrides into account over the global default.
 */
function resolveMaxExitDuration<TData>(
  removedKeys: ReadonlySet<string>,
  globalDuration: number,
  findEntryByKey: (key: string) => TrailEntry<TData> | undefined,
): number {
  let maxDuration = globalDuration;
  for (const key of removedKeys) {
    const entry = findEntryByKey(key);
    if (entry?.exitTransitionDuration !== undefined) {
      maxDuration = Math.max(maxDuration, entry.exitTransitionDuration);
    }
  }
  return maxDuration;
}

/**
 * Factory creating trail cascade actions (`openRoot`, `pushNested`, `closeFrom`, `closeByKey`, `closeAll`, `clearTrail`, `closeTopmost`).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @param ctx - Slice context providing Zustand set/get methods and dependencies.
 * @returns Trail slice action methods.
 */
export function createTrailSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const {
    activeControllers,
    transitionTimers,
    eventListeners,
    clearTransitionTimer,
    abortControllersForKeys,
    resetStoreState,
    findEntryByKey,
    pushSnapshot,
    popoverDAG,
  } = deps;

  const emitEvent = (event: PopoverStoreEvent<TData>) => dispatchStoreEvent(eventListeners, event);
  const getCurrentState = () => get();

  /** Marks all removed entries as 'unmounting' to trigger CSS exit animations. */
  const applyUnmountingState = (removedKeys: ReadonlySet<string>): void => {
    set((state) => {
      const update = (e: TrailEntry<TData>) =>
        removedKeys.has(e.key) ? { ...e, transitionStatus: 'unmounting' as const } : e;
      return {
        trail: state.trail.map(update),
        floating: state.floating.map(update),
      };
    });
  };

  /**
   * Builds the final cleanup patch that removes entries from floating/trail,
   * resets their pinned state, cleans up DAG nodes, and recomputes derived collections.
   */
  const buildCleanupPatch =
    (removedKeys: ReadonlySet<string>, filterUnmountingOnly = false) =>
    (state: PopoverStore<TData, TContext, TPopoverKey>) => {
      const keep = filterUnmountingOnly
        ? (e: TrailEntry<TData>) => !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting'
        : (e: TrailEntry<TData>) => !removedKeys.has(e.key);

      const nextFloating = state.floating.filter(keep);
      const nextTrail = state.trail.filter(keep);
      const nextPinnedStates = { ...state.pinnedStates };

      notifyAndPruneClosedEntries(
        removedKeys,
        nextFloating,
        nextTrail,
        nextPinnedStates,
        findEntryByKey,
        popoverDAG,
      );

      return {
        floating: nextFloating,
        trail: nextTrail,
        ...getCleanupStatePatch<TData, TContext>(
          nextFloating,
          nextTrail,
          state.offsets,
          state.zIndexOrder,
          nextPinnedStates,
          state.nestedHydrationRequestCounters,
        ),
      };
    };

  /** Removes entries immediately without exit animation delay. */
  const applyImmediateClose = (removedKeys: ReadonlySet<string>): void => {
    set(buildCleanupPatch(removedKeys));
  };

  const scheduleCustomTransitionExit = (
    removedKeys: ReadonlySet<string>,
    duration: number,
    scheduleFn: (key: string, duration: number, callback: () => void) => void,
    onExitComplete: () => void,
  ) => {
    let completedCount = 0;
    const totalCount = removedKeys.size;
    for (const key of removedKeys) {
      scheduleFn(key, duration, () => {
        completedCount += 1;
        if (completedCount >= totalCount) {
          onExitComplete();
        }
      });
    }
  };

  const scheduleStandardTransitionExit = (removedKeys: ReadonlySet<string>, duration: number) => {
    for (const key of removedKeys) {
      clearTransitionTimer(key);
      const timer = setTimeout(() => {
        transitionTimers.delete(key);
        set(buildCleanupPatch(new Set([key]), true));
      }, duration);
      transitionTimers.set(key, timer);
    }
  };

  /** Schedules the final state cleanup after all exit transitions have completed. */
  const scheduleExitCleanup = (removedKeys: ReadonlySet<string>, duration: number): void => {
    if (deps.scheduleTransitionExit) {
      scheduleCustomTransitionExit(removedKeys, duration, deps.scheduleTransitionExit, () => {
        set(buildCleanupPatch(removedKeys, true));
      });
    } else {
      scheduleStandardTransitionExit(removedKeys, duration);
    }
  };

  const slice = {
    openRoot: (ownerId: string, entry: TrailEntry<TData>) => {
      const current = getCurrentState();
      pushSnapshot(current);

      if (current.trail.length > 0) {
        const oldTrailKeys = current.trail.map((e) => e.key);
        abortControllersForKeys(oldTrailKeys);

        // If replacing trail for a different owner, prune old unpinned trail nodes from DAG
        if (current.ownerId !== ownerId) {
          pruneDAGNodes(popoverDAG, oldTrailKeys, current.floating);
        }
      }

      emitEvent({ type: 'open_root', key: entry.key, ownerId });
      set((state) => openRootState(state, ownerId, entry));
    },

    pushNested: (index: number, entry: TrailEntry<TData>) => {
      const current = getCurrentState();
      pushSnapshot(current);
      const { trail, floating } = current;
      const isFloating = index < floating.length;

      if (!isFloating) {
        const trailIndex = index - floating.length;
        if (trailIndex + 1 < trail.length) {
          const truncatedKeys = trail.slice(trailIndex + 1).map((e) => e.key);
          abortControllersForKeys(truncatedKeys);
          pruneDAGNodes(popoverDAG, truncatedKeys, floating);
        }
      }

      emitEvent({ type: 'push_nested', key: entry.key, parentKey: entry.parentKey });
      set((state) => pushNestedState(state, index, entry));
    },

    closeFrom: (index: number, options?: { transition?: boolean }) => {
      const { floating, trail, closePinnedDescendants, pinnedStates, exitTransitionDuration } =
        get();
      const res = getRemovedKeysForClose(
        floating,
        trail,
        index,
        closePinnedDescendants,
        pinnedStates,
      );
      if (!res) return;
      const { removedKeys } = res;

      pushSnapshot(getCurrentState());
      abortControllersForKeys(removedKeys);
      emitEvent({ type: 'close', keys: [...removedKeys] });

      const maxDuration = resolveMaxExitDuration(
        removedKeys,
        exitTransitionDuration,
        findEntryByKey,
      );

      if (options?.transition && maxDuration > 0) {
        applyUnmountingState(removedKeys);
        scheduleExitCleanup(removedKeys, maxDuration);
      } else {
        applyImmediateClose(removedKeys);
      }
    },

    clear: () => {
      emitEvent({ type: 'clear' });
      popoverDAG?.clear();
      resetStoreState();
    },

    closeAll: () => {
      emitEvent({ type: 'clear' });
      popoverDAG?.clear();
      resetStoreState();
    },

    clearTrail: () => {
      const { trail } = get();
      if (trail.length === 0) return;

      const rootController = activeControllers.get('__root__');
      if (rootController) {
        rootController.abort();
        activeControllers.delete('__root__');
      }

      const {
        floating,
        pinnedStates,
        offsets,
        zIndexOrder,
        nestedHydrationRequestCounters,
        closePinnedDescendants,
      } = get();

      const trailKeys = trail.map((e) => e.key);
      const descendants =
        getRemovedKeysForClose(floating, trail, 0, closePinnedDescendants, pinnedStates)
          ?.removedKeys ?? [];
      const removedKeys = new Set<string>([...trailKeys, ...descendants]);

      abortControllersForKeys(removedKeys);
      emitEvent({ type: 'close', keys: [...removedKeys] });

      const nextFloating = floating.filter((e) => !removedKeys.has(e.key));
      const nextPinnedStates = { ...pinnedStates };

      notifyAndPruneClosedEntries(
        removedKeys,
        nextFloating,
        [],
        nextPinnedStates,
        findEntryByKey,
        popoverDAG,
      );

      const cleanupPatch = getCleanupStatePatch<TData, TContext>(
        nextFloating,
        [],
        offsets,
        zIndexOrder,
        nextPinnedStates,
        nestedHydrationRequestCounters,
      );

      set({
        trail: EMPTY_ARRAY,
        floating: nextFloating,
        ...cleanupPatch,
      });
    },

    closeTopmost: (options?: { transition?: boolean }) => {
      const entry = selectTopmostEntry(get());
      if (!entry || entry.transitionStatus === 'unmounting') return;
      const idx = findEntryIndex(get().floating, get().trail, entry.key);
      if (idx !== -1) {
        slice.closeFrom(idx, options);
      }
    },

    closeByKey: (key: string, options?: { transition?: boolean }) => {
      const { floating, trail } = get();
      const entry = findEntryInStore(floating, trail, key);
      if (!entry) return;
      if (entry.transitionStatus === 'unmounting' && options?.transition) return;

      const index = findEntryIndex(floating, trail, key);
      if (index !== -1) {
        slice.closeFrom(index, options);
      }
    },
  };

  return slice;
}
