/**
 * QuadTree Node Coalescing & Branch Shrinkage.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialCoalesce
 */

import type { QuadItem } from '../guards/spatialGuards';
import type { QuadTree } from './quadTreeCore';

/**
 * Checks whether subdivided child quadrant nodes can be collapsed back into their parent.
 *
 * @remarks
 * Child quadrants can collapse if:
 * 1. None of the child quadrants have their own subdivided children (leaf level).
 * 2. The combined number of items in the parent and all child nodes does not exceed `maxItems`.
 *
 * @param nodes - Array of 4 child quadrant nodes.
 * @param parentItemCount - Number of items currently stored at the parent level.
 * @param maxItems - Node capacity limit.
 * @returns `true` if quadrants can safely collapse back into the parent.
 */
export function canCoalesceQuadNodes<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  parentItemCount: number,
  maxItems: number,
): boolean {
  if (nodes.length === 0) return false;
  let total = parentItemCount;
  for (const node of nodes) {
    if (node.getNodes().length > 0) return false;
    total += node.getItems().length;
    if (total > maxItems) return false;
  }
  return true;
}

/**
 * Checks whether subdivided child quadrant nodes can be collapsed into their parent.
 * Alias for {@link canCoalesceQuadNodes}.
 */
export const canCollapseQuadNodes = canCoalesceQuadNodes;

/**
 * Merges and deduplicates items from all child quadrants and the parent into a single list.
 *
 * @param nodes - Subdivided child quadrant nodes.
 * @param parentItems - Items stored at the parent level.
 * @returns Consolidated deduplicated item list.
 */
export function collectCoalescedItems<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  parentItems: readonly QuadItem<TId>[],
): QuadItem<TId>[] {
  const merged: QuadItem<TId>[] = [...parentItems];
  const seen = new Set<TId>(parentItems.map((it) => it.id));

  for (const node of nodes) {
    for (const item of node.getItems()) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        merged.push(item);
      }
    }
  }
  return merged;
}

/**
 * Consolidates all child items into a single deduplicated array.
 * Alias for {@link collectCoalescedItems}.
 */
export const collectCollapsedItems = collectCoalescedItems;

/**
 * Attempts to collapse child quadrants back into the parent if the combined item count is within capacity.
 *
 * @remarks
 * If conditions are met, pulls all items into the returned array, clears child nodes, and truncates `nodes.length = 0`.
 *
 * @param nodes - Mutable array of child quadrant nodes.
 * @param items - Mutable array of parent items.
 * @param maxItems - Capacity limit for a single node.
 * @returns Consolidated array of items if collapsed, or `null` if the node cannot be collapsed.
 */
export function tryCoalesceQuadTree<TId extends string>(
  nodes: QuadTree<TId>[],
  items: QuadItem<TId>[],
  maxItems: number,
): QuadItem<TId>[] | null {
  if (!canCoalesceQuadNodes(nodes, items.length, maxItems)) return null;
  const merged = collectCoalescedItems(nodes, items);
  for (const node of nodes) node.clear();
  nodes.length = 0;
  return merged;
}

/**
 * Attempts to collapse child quadrants back into the parent node if within capacity.
 * Alias for {@link tryCoalesceQuadTree}.
 */
export const tryCollapseQuadTree = tryCoalesceQuadTree;
