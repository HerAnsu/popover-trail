/**
 * Rect Normalization and Geometry Resolution for Popover Trail Entries.
 *
 * @module store/reducers/entry/entryGeometry
 */

import type { PopoverRect, TrailEntry } from '../../../types';
import { hasFunctionProperty } from '../../../utils/guards/objectGuards';

function cloneDOMRect(rect: DOMRect | PopoverRect): DOMRect {
  const x = rect.x ?? rect.left ?? 0;
  const y = rect.y ?? rect.top ?? 0;
  const width = rect.width ?? 0;
  const height = rect.height ?? 0;
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
    toJSON: hasFunctionProperty(rect, 'toJSON')
      ? () => rect.toJSON()
      : () => rect,
  };
}

export interface EntryGeometryMetadata<TPopoverKey extends string = string> {
  readonly rect?: DOMRect;
  readonly originalRect?: DOMRect;
  readonly originalParentKey?: TPopoverKey;
}

/**
 * Resolves geometry metadata ensuring pure cloned DOMRect and original parent persistence.
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
