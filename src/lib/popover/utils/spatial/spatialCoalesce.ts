/**
 * QuadTree Node Coalescing & Branch Shrinkage.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialCoalesce
 */

import type { QuadItem } from '../guards/spatialGuards';
import type { QuadTree } from './quadTreeCore';

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
