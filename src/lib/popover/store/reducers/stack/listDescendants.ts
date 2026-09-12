/**
 * Array-based Parent-Child Descendant Collection for Floating & Trail Lists.
 *
 * @module store/reducers/stack/listDescendants
 */

import type { TrailEntry } from '../../../types';

function collectChildrenFromList<TData, TPopoverKey extends string = string>(
  list: readonly TrailEntry<TData, TPopoverKey>[],
  current: TPopoverKey,
  closePinnedDescendants: boolean,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void {
  for (const entry of list) {
    if (!entry) continue;
    const parentKey = entry.parentKey;
    const effectiveParent = closePinnedDescendants
      ? (entry.originalParentKey ?? parentKey)
      : parentKey;

    if (effectiveParent === current && !visited.has(entry.key)) {
      queue.push(entry.key);
    }
  }
}

/**
 * Enqueues unvisited child keys from floating and trail lists into the queue.
 */
export function enqueueListChildren<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  current: TPopoverKey,
  closePinned: boolean,
  visited: ReadonlySet<TPopoverKey>,
  queue: { push(item: TPopoverKey): unknown },
): void {
  if (closePinned) {
    collectChildrenFromList(floating, current, true, visited, queue);
  }
  collectChildrenFromList(trail, current, closePinned, visited, queue);
}
