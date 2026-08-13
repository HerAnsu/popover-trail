/**
 * Pin & Modeless Floating State Reducer for popover-trail store.
 *
 * @module store/reducers/pinReducers
 */

import type { PopoverStateData } from '../../types';
import { getCleanupStatePatch } from './stackReducers';

function resolvePinnedLayoutPos(
  rect?: DOMRect,
  entry?: { pinnedLayoutPos?: { top: number; left: number }; rect?: DOMRect | null },
): { top: number; left: number } | undefined {
  if (rect) return { top: rect.top, left: rect.left };
  if (entry?.pinnedLayoutPos) return entry.pinnedLayoutPos;
  if (entry?.rect) return { top: entry.rect.top, left: entry.rect.left };
  return undefined;
}

/**
 * Pure state updater for toggling a popover's modeless pinned/floating vs trailing status.
 */
export function togglePinState<TData, TContext>(
  state: PopoverStateData<TData, TContext>,
  key: string,
  rect?: DOMRect,
): Partial<PopoverStateData<TData, TContext>> {
  const floatingIndex = state.floating.findIndex((e) => e.key === key);
  const wasPinned = floatingIndex !== -1;
  const trailIndex = wasPinned ? -1 : state.trail.findIndex((e) => e.key === key);

  if (!wasPinned && trailIndex === -1) {
    return {
      floating: state.floating,
      trail: state.trail,
    };
  }

  const nextFloating = [...state.floating];
  const nextTrail = [...state.trail];
  const nextPinnedStates = { ...state.pinnedStates };
  const nextOffsets = { ...state.offsets };
  let nextZIndexOrder = [...state.zIndexOrder];

  if (!wasPinned) {
    const entry = state.trail[trailIndex];
    if (!entry) return {};
    const updatedEntry = {
      ...entry,
      rect: rect ?? entry.rect,
      pinnedLayoutPos: resolvePinnedLayoutPos(rect, entry),
      parentKey: undefined,
    };
    nextTrail.splice(trailIndex, 1);
    nextFloating.push(updatedEntry);
    nextOffsets[key] = { x: 0, y: 0 };
    nextPinnedStates[key] = true;
    nextZIndexOrder = [...nextZIndexOrder.filter((k) => k !== key), key];
  } else {
    const entry = nextFloating[floatingIndex];
    nextFloating.splice(floatingIndex, 1);
    nextPinnedStates[key] = false;
    delete nextOffsets[key];
    if (entry) {
      nextTrail.push({
        ...entry,
        rect: entry.originalRect ?? entry.rect,
        parentKey: entry.originalParentKey ?? entry.parentKey,
        pinnedLayoutPos: undefined,
      });
    }
  }

  const cleanupPatch = getCleanupStatePatch<TData, TContext>(
    nextFloating,
    nextTrail,
    nextOffsets,
    nextZIndexOrder,
    nextPinnedStates,
    state.nestedHydrationRequestCounters ?? {},
  );

  return {
    floating: nextFloating,
    trail: nextTrail,
    ...cleanupPatch,
  };
}
