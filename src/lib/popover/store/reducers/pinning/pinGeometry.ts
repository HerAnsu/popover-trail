/**
 * Geometric Transformations and Format Mapping for Pinned Popover Cards.
 *
 * @module store/reducers/pinning/pinGeometry
 */

import type { PopoverRect, TrailEntry } from '../../../types';
import { resolvePinnedLayoutPos } from './pinCoordinates';

/**
 * Transforms an entry into modeless floating card format.
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
 */
export function toTrailEntry<TData, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
): TrailEntry<TData, TPopoverKey> {
  return {
    ...entry,
    rect: entry.originalRect ?? entry.rect,
    parentKey: entry.originalParentKey ?? entry.parentKey,
    pinnedLayoutPos: undefined,
  };
}
