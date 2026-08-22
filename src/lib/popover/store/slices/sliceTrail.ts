/**
 * Trail Stack Domain Action Slice for popover-trail.
 * Encapsulates trail stack navigation actions (openRoot, pushNested, closeFrom, closeByKey, closeAll, clearTrail, closeTopmost).
 *
 * @module store/slices/sliceTrail
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
import { getAllDescendants } from '../reducers/stackReducers';
import { selectTopmostEntry } from '../storeSelectors';
import { EMPTY_ARRAY } from '../storeDefaults';
import { dispatchStoreEvent } from '../eventBus';
import { wrapResult, isErr } from '../../utils/result';
import type { SliceContext } from './sliceContext';
import type { PopoverDAG } from '../../utils/dag';

/**
 * Safely removes nodes from the DAG kernel if they are no longer active
 * in either trailing or floating lists, preventing unbounded graph growth.
 */
function pruneDAGNodes<TData, TPopoverKey extends string = string>(
  dag: PopoverDAG | undefined,
  keysToPrune: Iterable<TPopoverKey>,
  remainingFloating: readonly TrailEntry<TData, TPopoverKey>[],
  remainingTrail: readonly TrailEntry<TData, TPopoverKey>[] = [],
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
function notifyAndPruneClosedEntries<TData, TPopoverKey extends string = string>(
  removedKeys: ReadonlySet<TPopoverKey>,
  nextFloating: readonly TrailEntry<TData, TPopoverKey>[],
  nextTrail: readonly TrailEntry<TData, TPopoverKey>[],
  nextPinnedStates: Partial<Record<TPopoverKey, boolean>>,
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
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
        const closeResult = wrapResult(() => removedEntry.onClose?.(key));
        if (isErr(closeResult)) {
          console.error('[popover-trail]: Exception in onClose callback:', closeResult.error);
        }
      }
    }
  }
}

/**
 * Calculates the maximum exit transition duration across all removed keys,
 * taking per-entry duration overrides into account over the global default.
 */
function resolveMaxExitDuration<TData, TPopoverKey extends string = string>(
  removedKeys: ReadonlySet<TPopoverKey>,
  globalDuration: number,
  findEntryByKey: (key: string) => TrailEntry<TData, TPopoverKey> | undefined,
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
 * @template TPopoverKey - Popover key string union.
 * @param ctx - Store dependency injection slice context.
 * @returns Trail action dispatch methods.
 */
export function createTrailSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const {
    activeControllers,
    eventListeners,
    abortControllersForKeys,
    resetStoreState,
    findEntryByKey,
    pushSnapshot,
    popoverDAG,
    transitionScheduler,
  } = deps;

  const emitEvent = (event: PopoverStoreEvent<TData>) =>
    dispatchStoreEvent(eventListeners, event, deps.eventBus);
  const getCurrentState = () => get();

  /** Marks all removed entries as 'unmounting' to trigger CSS exit animations. */
  const applyUnmountingState = (removedKeys: ReadonlySet<TPopoverKey>): void => {
    set((state) => {
      const update = (e: TrailEntry<TData, TPopoverKey>) =>
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
    (removedKeys: ReadonlySet<TPopoverKey>, filterUnmountingOnly = false) =>
    (state: PopoverStore<TData, TContext, TPopoverKey>) => {
      const keep = filterUnmountingOnly
        ? (e: TrailEntry<TData, TPopoverKey>) =>
            !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting'
        : (e: TrailEntry<TData, TPopoverKey>) => !removedKeys.has(e.key);

      const nextFloating = state.floating.filter(keep);
      const rawNextTrail = state.trail.filter(keep);
      const nextTrail = rawNextTrail.length === 0 ? EMPTY_ARRAY : rawNextTrail;
      const nextPinnedStates: Partial<Record<TPopoverKey, boolean>> = { ...state.pinnedStates };

      notifyAndPruneClosedEntries<TData, TPopoverKey>(
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
        ...getCleanupStatePatch<TData, TContext, TPopoverKey>(
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
  const applyImmediateClose = (removedKeys: ReadonlySet<TPopoverKey>): void => {
    transitionScheduler.cancelAllForKeys(removedKeys);
    set(buildCleanupPatch(removedKeys));
  };

  let exitBatchSeq = 0;

  /**
   * Schedules the final state cleanup after all exit transitions have completed.
   * Every removed key shares the same pre-computed max duration, so a single
   * batched timer replaces N per-key timers that each re-filtered the whole state.
   */
  const scheduleExitCleanup = (removedKeys: ReadonlySet<TPopoverKey>, duration: number): void => {
    if (removedKeys.size === 0) return;
    // Unique batch id prevents overlapping closes from cancelling each other.
    const batchKey = `__pt_exit_batch_${++exitBatchSeq}`;
    transitionScheduler.scheduleExitTransition(batchKey, duration, () => {
      set(buildCleanupPatch(removedKeys, true));
    });
  };

  /** Shared reset handler resetting state, DAG hierarchy, and emitting clear event. */
  const handleResetAll = (): void => {
    emitEvent({ type: 'clear' });
    popoverDAG?.clear();
    resetStoreState();
  };

  const slice = {
    openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => {
      popoverDAG?.addNode(entry.key);
      const current = getCurrentState();
      pushSnapshot(current);

      if (current.trail.length > 0) {
        const oldTrailKeys = current.trail.map((e) => e.key);
        abortControllersForKeys(oldTrailKeys);
        transitionScheduler.cancelAllForKeys(oldTrailKeys);

        if (current.ownerId !== ownerId) {
          pruneDAGNodes<TData, TPopoverKey>(popoverDAG, oldTrailKeys, current.floating);
        }
      }

      emitEvent({ type: 'open_root', key: entry.key, ownerId });
      set((state) => openRootState(state, ownerId, entry));
    },

    pushNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => {
      popoverDAG?.addNode(entry.key, entry.parentKey);
      const current = getCurrentState();
      pushSnapshot(current);
      const { trail, floating } = current;
      const isFloating = index < floating.length;

      if (!isFloating) {
        const trailIndex = index - floating.length;
        if (trailIndex + 1 < trail.length) {
          const truncatedKeys = trail.slice(trailIndex + 1).map((e) => e.key);
          abortControllersForKeys(truncatedKeys);
          pruneDAGNodes<TData, TPopoverKey>(popoverDAG, truncatedKeys, floating);
        }
      }

      emitEvent({ type: 'push_nested', key: entry.key, parentKey: entry.parentKey });
      set((state) => pushNestedState(state, index, entry));
    },

    closeFrom: (index: number, options?: { transition?: boolean }) => {
      const { floating, trail, closePinnedDescendants, pinnedStates, exitTransitionDuration } =
        get();
      const res = getRemovedKeysForClose<TData, TPopoverKey>(
        floating,
        trail,
        index,
        closePinnedDescendants,
        pinnedStates,
        popoverDAG,
      );
      if (!res) return;
      const { removedKeys } = res;

      pushSnapshot(getCurrentState());
      abortControllersForKeys(removedKeys);
      emitEvent({ type: 'close', keys: [...removedKeys] });

      const maxDuration = resolveMaxExitDuration<TData, TPopoverKey>(
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

    clear: handleResetAll,

    closeAll: handleResetAll,

    clearTrail: (options?: { transition?: boolean }) => {
      const { trail, floating, pinnedStates, closePinnedDescendants, exitTransitionDuration } =
        get();
      if (trail.length === 0) return;

      const rootController = activeControllers.get('__root__');
      if (rootController) {
        rootController.abort();
        activeControllers.delete('__root__');
      }

      const trailKeys = trail.map((e) => e.key);
      const descendants = getAllDescendants<TData, TPopoverKey>(
        trailKeys,
        floating,
        trail,
        closePinnedDescendants,
        popoverDAG,
      );

      const removedKeys = new Set<TPopoverKey>(trailKeys);
      for (const key of descendants) {
        if (closePinnedDescendants || !pinnedStates[key]) {
          removedKeys.add(key);
        }
      }

      pushSnapshot(getCurrentState());
      abortControllersForKeys(removedKeys);
      emitEvent({ type: 'close', keys: [...removedKeys] });

      const maxDuration = resolveMaxExitDuration<TData, TPopoverKey>(
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

    closeTopmost: (options?: { transition?: boolean }) => {
      const entry = selectTopmostEntry<TData, TPopoverKey>(get());
      if (!entry || entry.transitionStatus === 'unmounting') return;
      const idx = findEntryIndex(get().floating, get().trail, entry.key);
      if (idx !== -1) {
        slice.closeFrom(idx, options);
      }
    },

    closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => {
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
