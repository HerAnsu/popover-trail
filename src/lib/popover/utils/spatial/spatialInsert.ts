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
  if (nodes.length > 0) {
    const idx = getQuadrantIndex(item.bounds, bounds);
    if (idx !== -1 && nodes[idx]) {
      nodes[idx].insert(item);
      return items;
    }
  }
  items.push(item);
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
