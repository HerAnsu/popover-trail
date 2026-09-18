/**
 * Rect Normalization and Geometry Resolution for Popover Trail Entries.
 *
 * @module store/reducers/entry/entryGeometry
 */

import type { PopoverRect, TrailEntry } from '../../../types';
import { hasFunctionProperty } from '../../../utils/guards/objectGuards';
import { toFiniteNumber } from '../../../utils/math';
import { constant } from '../../../utils/functional';

function cloneDOMRect(rect: DOMRect | PopoverRect): DOMRect {
  const x = toFiniteNumber(rect.x ?? rect.left);
  const y = toFiniteNumber(rect.y ?? rect.top);
  const width = Math.max(0, toFiniteNumber(rect.width));
  const height = Math.max(0, toFiniteNumber(rect.height));
  if (typeof DOMRect !== 'undefined') {
    return new DOMRect(x, y, width, height);
  }
  return {
    x,
    y,
    width,
    height,
    top: rect.top ?? y,
    right: rect.right ?? x + width,
    bottom: rect.bottom ?? y + height,
    left: rect.left ?? x,
    toJSON: hasFunctionProperty(rect, 'toJSON') ? () => rect.toJSON() : constant(rect),
  };
}

export interface EntryGeometryMetadata<TPopoverKey extends string = string> {
  readonly rect?: DOMRect;
  readonly originalRect?: DOMRect;
  readonly originalParentKey?: TPopoverKey;
}

/**
 * Resolves geometry metadata ensuring pure cloned DOMRect and original parent persistence.
 *
 * @example
 * ```ts
 * const meta = resolveEntryGeometryMetadata(
 *   triggerRect,
 *   'rootKey',
 *   existingEntry,
 * );
 * console.log(meta.rect, meta.originalParentKey);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param rect - Optional active or trigger DOMRect/PopoverRect.
 * @param parentKey - Optional key of the direct parent card.
 * @param existingEntry - Optional prior entry to retain original geometry from.
 * @returns Geometry metadata containing cloned rect, originalRect, and originalParentKey.
 */
export function resolveEntryGeometryMetadata<TData = unknown, TPopoverKey extends string = string>(
  rect?: DOMRect | PopoverRect | null,
  parentKey?: TPopoverKey,
  existingEntry?: TrailEntry<TData, TPopoverKey>,
): EntryGeometryMetadata<TPopoverKey> {
  let finalRect: DOMRect | null = null;
  if (rect) {
    finalRect = cloneDOMRect(rect);
  } else if (existingEntry?.rect) {
    finalRect = cloneDOMRect(existingEntry.rect);
  }

  let finalOriginalRect: DOMRect | null = null;
  if (existingEntry?.originalRect) {
    finalOriginalRect = cloneDOMRect(existingEntry.originalRect);
  } else if (finalRect) {
    finalOriginalRect = cloneDOMRect(finalRect);
  }

  const originalParentKey = existingEntry?.originalParentKey ?? parentKey ?? undefined;

  return {
    rect: finalRect ?? undefined,
    originalRect: finalOriginalRect ?? undefined,
    originalParentKey,
  };
}
