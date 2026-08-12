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
import type { SliceContext } from './sliceContext';

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
  } = deps;

  const emitEvent = (event: PopoverStoreEvent<TData>) => {
    for (const listener of eventListeners) {
      try {
        listener(event);
      } catch (err) {
        console.error('[popover-trail]: Exception in store event listener:', err);
      }
    }
  };

  const getCurrentState = () => get();

  /**
   * Returns the maximum exit duration across all removedKeys,
   * taking per-entry overrides into account over the global default.
   */
  const resolveMaxExitDuration = (removedKeys: ReadonlySet<string>): number => {
    const { exitTransitionDuration: globalDuration } = get();
    let max = globalDuration;
    for (const key of removedKeys) {
      const entry = findEntryByKey(key);
      if (entry?.exitTransitionDuration !== undefined) {
        max = Math.max(max, entry.exitTransitionDuration);
      }
    }
    return max;
  };

  /** Marks all removed entries as 'unmounting' to trigger exit animations. */
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
   * resets their pinned state, and recomputes derived collections.
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

      for (const k of removedKeys) {
        const stillPresent =
          nextFloating.some((e) => e.key === k) || nextTrail.some((e) => e.key === k);
        if (!stillPresent) {
          nextPinnedStates[k] = false;
        }
      }

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

  /** Removes entries immediately with no animation. */
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

  /**
   * Schedules the final cleanup after all exit transitions have completed.
   * Supports the optional `scheduleTransitionExit` injection for testing.
   */
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
        abortControllersForKeys(current.trail.map((e) => e.key));
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
        }
      }
      emitEvent({ type: 'push_nested', key: entry.key, parentKey: entry.parentKey });
      set((state) => pushNestedState(state, index, entry));
    },

    closeFrom: (index: number, options?: { transition?: boolean }) => {
      const { floating, trail, closePinnedDescendants } = get();
      const res = getRemovedKeysForClose(floating, trail, index, closePinnedDescendants);
      if (!res) return;
      const { removedKeys } = res;

      pushSnapshot(getCurrentState());
      abortControllersForKeys(removedKeys);

      const maxDuration = resolveMaxExitDuration(removedKeys);

      if (options?.transition && maxDuration > 0) {
        applyUnmountingState(removedKeys);
        scheduleExitCleanup(removedKeys, maxDuration);
      } else {
        applyImmediateClose(removedKeys);
      }
    },

    clear: resetStoreState,

    closeAll: resetStoreState,

    clearTrail: () => {
      const { trail } = get();
      if (trail.length === 0) return;

      const rootController = activeControllers.get('__root__');
      if (rootController) {
        rootController.abort();
        activeControllers.delete('__root__');
      }
      const { floating, pinnedStates, offsets, zIndexOrder, nestedHydrationRequestCounters } =
        get();
      const trailKeys = trail.map((e) => e.key);
      const descendants = getRemovedKeysForClose(floating, trail, 0, false)?.removedKeys ?? [];
      const removedKeys = new Set<string>([...trailKeys, ...descendants]);

      abortControllersForKeys(removedKeys);

      const nextFloating = floating.filter((e) => !removedKeys.has(e.key));
      const nextPinnedStates = { ...pinnedStates };
      for (const key of removedKeys) {
        nextPinnedStates[key] = false;
      }

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
