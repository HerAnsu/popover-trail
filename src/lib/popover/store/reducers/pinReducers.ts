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
 * Pure state reducer computing next state when toggling between floating (pinned) and cascade (trail) modes.
 *
 * @remarks
 * When pinning:
 * - Moves the entry from `trail` to `floating`.
 * - Locks the current DOM coordinates into `pinnedLayoutPos`.
 * - Elevates the card to the top of `zIndexOrder`.
 *
 * When unpinning:
 * - Moves the entry from `floating` back to `trail`.
 * - Restores its original parent linkage and relative cascade geometry.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @param state - Current reactive store state.
 * @param key - Target popover key to pin or unpin.
 * @param rect - Optional current DOM bounding box of the card.
 * @returns Partial state patch to apply.
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
