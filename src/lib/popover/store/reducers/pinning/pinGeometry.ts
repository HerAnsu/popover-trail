/**
 * Geometric Transformations and Format Mapping for Pinned Popover Cards.
 *
 * @module store/reducers/pinning/pinGeometry
 */

import type { PopoverRect, TrailEntry } from '../../../types';
import { resolvePinnedLayoutPos } from './pinCoordinates';

/**
 * Transforms an entry into modeless floating card format.
 *
 * @example
 * ```ts
 * const floating = toFloatingEntry(entry, currentRect);
 * console.log(floating.parentKey); // undefined
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param entry - Active trail entry to transform.
 * @param rect - Optional bounding rect captured at pinning.
 * @returns Modified TrailEntry configured for floating/pinned behavior.
 */
export function toFloatingEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  rect?: DOMRect | PopoverRect | null,
): TrailEntry<TData, TPopoverKey> {
  return {
    ...entry,
    rect: rect ?? entry.rect,
    pinnedLayoutPos: resolvePinnedLayoutPos(rect, entry),
    parentKey: undefined,
  };
}

/**
 * Reverts a floating entry back to hierarchical cascade trail format.
 *
 * @example
 * ```ts
 * const trailEntry = toTrailEntry(floatingEntry);
 * console.log(trailEntry.parentKey); // restored to original parent key
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param entry - Pinned floating entry to restore.
 * @returns Modified TrailEntry configured for cascade trail positioning.
 */
export function toTrailEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  const { originalRect, rect, originalParentKey, parentKey } = entry;
  return {
    ...entry,
    rect: originalRect ?? rect,
    parentKey: originalParentKey ?? parentKey,
    pinnedLayoutPos: undefined,
  };
}
