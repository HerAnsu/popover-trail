/**
 * Quadrant splitting and item insertion logic for 2D QuadTree.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/spatialInsert
 */

import { type BoundingBox, type QuadItem, isValidQuadItem } from '../guards/spatialGuards';
import { getQuadrantIndex } from './spatialBounds';
import { subdivideQuadrantBounds } from './spatialSubdivide';
import type { QuadTree } from './quadTreeCore';

/**
 * Subdivides a parent node boundary into four quadrant children (NE, NW, SW, SE).
 *
 * @param bounds - Spatial boundary of the parent node.
 * @param maxItems - Threshold count before a child node will split.
 * @param maxLevels - Maximum tree depth limit.
 * @param nextLevel - Depth tier index for the newly created children.
 * @param factory - Factory function to instantiate QuadTree nodes without circular imports.
 * @returns Tuple-like array containing [ne, nw, sw, se] child QuadTree instances.
 */
export function splitQuadTreeNodes<TId extends string>(
  bounds: BoundingBox,
  maxItems: number,
  maxLevels: number,
  nextLevel: number,
  factory: (b: BoundingBox, mi: number, ml: number, l: number) => QuadTree<TId>,
): QuadTree<TId>[] {
  const sub = subdivideQuadrantBounds(bounds);
  return [
    factory(sub.ne, maxItems, maxLevels, nextLevel),
    factory(sub.nw, maxItems, maxLevels, nextLevel),
    factory(sub.sw, maxItems, maxLevels, nextLevel),
    factory(sub.se, maxItems, maxLevels, nextLevel),
  ];
}

/**
 * Inserts an item into a QuadTree node or delegates to the appropriate sub-quadrant.
 *
 * @remarks
 * If the item fits entirely inside one of the 4 sub-quadrants, it is delegated to that child.
 * If it straddles quadrant boundaries, it remains stored in this parent node.
 * When the parent node exceeds `maxItems` capacity and has not reached `maxLevels`, it splits
 * into 4 sub-quadrants and redistributes existing items.
 *
 * @param nodes - Array of child quadrant nodes.
 * @param items - Items currently stored in this node.
 * @param bounds - Boundary of this node.
 * @param maxItems - Maximum items before triggering a split.
 * @param maxLevels - Maximum tree depth.
 * @param level - Current depth level of this node.
 * @param item - Candidate item to insert.
 * @param onSplit - Callback to create child quadrants when splitting.
 * @returns Array of items that remain at this node level (those that cannot fit in a single child quadrant).
 *
 * @example
 * ```typescript
 * insertQuadTreeItem(nodes, items, bounds, 16, 8, 0, newItem, () => split());
 * ```
 */
export function insertQuadTreeItem<TId extends string>(
  nodes: QuadTree<TId>[],
  items: QuadItem<TId>[],
  bounds: BoundingBox,
  maxItems: number,
  maxLevels: number,
  level: number,
  item: QuadItem<TId> | Partial<QuadItem<TId>> | null | undefined,
  onSplit: () => void,
): QuadItem<TId>[] {
  if (!isValidQuadItem<TId>(item)) return items;

  // If already subdivided, check if this item fits completely within one of the 4 quadrants
  if (nodes.length > 0) {
    const idx = getQuadrantIndex(item.bounds, bounds);
    if (idx !== -1 && nodes[idx]) {
      nodes[idx].insert(item);
      return items;
    }
  }

  // Item straddles quadrant boundaries or node has not subdivided yet: store at this node level
  items.push(item);

  // Subdivide and redistribute if node capacity is exceeded and depth limit is not reached
  if (items.length > maxItems && level < maxLevels) {
    if (nodes.length === 0) onSplit();
    const remaining: QuadItem<TId>[] = [];
    for (const cur of items) {
      const idx = getQuadrantIndex(cur.bounds, bounds);
      if (idx !== -1 && nodes[idx]) nodes[idx].insert(cur);
      else remaining.push(cur);
    }
    return remaining;
  }
  return items;
}

/**
 * Removes an item matching the specified ID from items or child quadrants.
 *
 * @param nodes - Child quadrant nodes.
 * @param items - Items stored at this node level.
 * @param id - Identifier of the item to remove.
 * @returns `true` if an item was found and removed, `false` otherwise.
 *
 * @example
 * ```typescript
 * const removed = removeQuadTreeItem(nodes, items, 'card-1');
 * ```
 */
export function removeQuadTreeItem<TId extends string>(
  nodes: readonly QuadTree<TId>[],
  items: QuadItem<TId>[],
  id: TId,
): boolean {
  if (!id) return false;
  const idx = items.findIndex((item) => item.id === id);
  if (idx !== -1) {
    items.splice(idx, 1);
    return true;
  }
  for (const n of nodes) if (n.remove(id)) return true;
  return false;
}
