/**
 * Trail Stack Domain Action Slice for popover-trail.
 * Encapsulates trail stack navigation actions (openRoot, pushNested, closeFrom, closeByKey, closeAll, clearTrail, closeTopmost).
 *
 * @module sliceTrail
 */

import type { TrailEntry, PopoverStoreEvent } from '../../types';
import {
  openRootState,
  pushNestedState,
  getCleanupStatePatch,
  getRemovedKeysForClose,
  findEntryInStore,
  findEntryIndex,
} from '../../utils/storeHelpers';
import { selectTopmostEntry } from '../storeSelectors';
import type { SliceContext } from './sliceContext';

export function createTrailSlice<TData = unknown, TContext = unknown>(
  ctx: SliceContext<TData, TContext>,
) {
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
        listener(event as PopoverStoreEvent<TData>);
      } catch (err) {
        console.error('[popover-trail]: Exception in store event listener:', err);
      }
    }
  };

  const getCurrentState = () => get();

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

      const { exitTransitionDuration: globalDuration } = get();
      let maxDuration = globalDuration;
      for (const key of removedKeys) {
        const entry = findEntryByKey(key);
        if (entry?.exitTransitionDuration !== undefined) {
          maxDuration = Math.max(maxDuration, entry.exitTransitionDuration);
        }
      }

      if (options?.transition && maxDuration > 0) {
        set((state) => {
          const update = (e: TrailEntry<TData>) =>
            removedKeys.has(e.key) ? { ...e, transitionStatus: 'unmounting' as const } : e;
          return {
            trail: state.trail.map(update),
            floating: state.floating.map(update),
          };
        });

        const onExitComplete = () => {
          set((state) => {
            const nextFloating = state.floating.filter(
              (e) => !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting',
            );
            const nextTrail = state.trail.filter(
              (e) => !removedKeys.has(e.key) || e.transitionStatus !== 'unmounting',
            );
            const nextPinnedStates = { ...state.pinnedStates };
            for (const k of removedKeys) {
              const exists =
                nextFloating.some((e) => e.key === k) || nextTrail.some((e) => e.key === k);
              if (!exists) {
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
          });
        };

        if (deps.scheduleTransitionExit) {
          for (const key of removedKeys) {
            deps.scheduleTransitionExit(key, maxDuration, onExitComplete);
          }
        } else {
          for (const key of removedKeys) {
            clearTransitionTimer(key);
          }
          const exitTimer = setTimeout(() => {
            for (const key of removedKeys) {
              transitionTimers.delete(key);
            }
            onExitComplete();
          }, maxDuration);

          for (const key of removedKeys) {
            clearTransitionTimer(key);
            transitionTimers.set(key, exitTimer);
          }
        }
      } else {
        set((state) => {
          const nextFloating = state.floating.filter((e) => !removedKeys.has(e.key));
          const nextTrail = state.trail.filter((e) => !removedKeys.has(e.key));
          const nextPinnedStates = { ...state.pinnedStates };
          for (const k of removedKeys) {
            nextPinnedStates[k] = false;
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
        });
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
        trail: [],
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
