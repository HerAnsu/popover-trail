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
    const { parentKey, originalParentKey, key } = entry;
    const effectiveParent = closePinnedDescendants
      ? (originalParentKey ?? parentKey)
      : parentKey;

    if (effectiveParent === current && !visited.has(key)) {
      queue.push(key);
    }
  }
}

/**
 * Enqueues unvisited child keys from floating and trail lists into the queue.
 *
 * @example
 * ```ts
 * enqueueListChildren(floating, trail, 'card-1', true, visitedSet, queue);
 * ```
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Valid popover key union.
 * @param floating - Readonly array of floating pinned entries.
 * @param trail - Readonly array of active cascading trail entries.
 * @param current - Current parent key being expanded.
 * @param closePinned - Whether pinned children should also be enqueued.
 * @param visited - Set of already visited keys.
 * @param queue - Queue to push unvisited child keys into.
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
