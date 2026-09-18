/**
 * TrailEntry Node Normalization with Structural Sharing.
 *
 * @module store/reducers/entry/entryNode
 */

import type { TrailEntry } from '../../../types';

export interface EntryFactoryOptions {
  readonly isRoot?: boolean;
}

/**
 * Normalizes `TrailEntry` nodes, guaranteeing structural sharing and immutability.
 * Sets `originalParentKey` and `originalRect` fallback fields, preventing self-referential parent cycles.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Registered string key identifiers.
 * @param entry - Candidate TrailEntry to normalize.
 * @param options - Optional factory flags (e.g. `isRoot`).
 * @returns Normalized `TrailEntry` instance, or identical reference if already normalized.
 *
 * @example
 * ```typescript
 * const node = createTrailEntryNode(rawEntry, { isRoot: false });
 * ```
 */
export function createTrailEntryNode<TData = unknown, TPopoverKey extends string = string>(
  entry: TrailEntry<TData, TPopoverKey>,
  options?: EntryFactoryOptions,
): TrailEntry<TData, TPopoverKey> {
  const isRoot = options?.isRoot ?? false;
  const {
    key,
    parentKey: entryParentKey,
    originalParentKey: entryOriginalParentKey,
    originalRect: entryOriginalRect,
    rect,
  } = entry;
  const parentKey = isRoot || entryParentKey === key ? undefined : entryParentKey;
  const originalParentKey = entryOriginalParentKey ?? entryParentKey;
  const originalRect = entryOriginalRect ?? rect;

  if (
    entryParentKey === parentKey &&
    entryOriginalParentKey === originalParentKey &&
    entryOriginalRect === originalRect
  ) {
    return entry;
  }

  return {
    ...entry,
    parentKey,
    originalParentKey,
    originalRect,
  };
}
