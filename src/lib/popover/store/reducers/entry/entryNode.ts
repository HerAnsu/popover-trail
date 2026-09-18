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
  const parentKey = isRoot || entry.parentKey === entry.key ? undefined : entry.parentKey;
  const originalParentKey = entry.originalParentKey ?? entry.parentKey;
  const originalRect = entry.originalRect ?? entry.rect;

  if (
    entry.parentKey === parentKey &&
    entry.originalParentKey === originalParentKey &&
    entry.originalRect === originalRect
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
