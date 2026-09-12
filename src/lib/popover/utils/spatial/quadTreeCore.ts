/**
 * 2D QuadTree Core Class Implementation.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/spatial/quadTreeCore
 */

import { DISPOSE_SYMBOL } from '../disposable';
import { type BoundingBox, type QuadItem } from '../guards/spatialGuards';
import { isPositiveFinite, isNonNegativeFinite } from '../guards/numberGuards';
import { sanitizeSpatialBounds } from './spatialBounds';
import {
  findFirstInNodes,
  hasCollisionInNodes,
  queryQuadTreeItems,
  visitQuadTreeItems,
} from './spatialQuery';
import { withPooledSeen } from './spatialQueryPool';
import { findNearestQuadItem } from './spatialKNN';
import { insertQuadTreeItem, removeQuadTreeItem, splitQuadTreeNodes } from './spatialInsert';
import { tryCoalesceQuadTree } from './spatialCoalesce';
import type { Point2D } from './spatialEnergy';

export class QuadTree<TId extends string = string> {
  private items: QuadItem<TId>[] = [];
  private nodes: QuadTree<TId>[] = [];
  private readonly maxItems: number;
  private readonly maxLevels: number;
  readonly bounds: BoundingBox;
  private readonly level: number;

  constructor(bounds: BoundingBox, maxItems = 16, maxLevels = 8, level = 0) {
    this.bounds = sanitizeSpatialBounds(bounds);
    this.maxItems = isPositiveFinite(maxItems) ? maxItems : 16;
    this.maxLevels = isPositiveFinite(maxLevels) ? maxLevels : 8;
    this.level = isNonNegativeFinite(level) ? level : 0;
  }

  public getItems(): readonly QuadItem<TId>[] {
    return this.items;
  }
  public getNodes(): readonly QuadTree<TId>[] {
    return this.nodes;
  }
  public get maxItemsCapacity(): number {
    return this.maxItems;
  }
  public get maxLevelsLimit(): number {
    return this.maxLevels;
  }
  public get size(): number {
    let count = this.items.length;
    for (const n of this.nodes) count += n.size;
    return count;
  }

  public clear(): void {
    this.items = [];
    for (const n of this.nodes) n.clear();
    this.nodes = [];
  }

  private split(): void {
    const next = this.level + 1;
    const newNodes = splitQuadTreeNodes(
      this.bounds,
      this.maxItems,
      this.maxLevels,
      next,
      (b, mi, ml, l) => new QuadTree<TId>(b, mi, ml, l),
    );
    this.nodes.length = 0;
    this.nodes.push(...newNodes);
  }

  public coalesce(): boolean {
    const merged = tryCoalesceQuadTree(this.nodes, this.items, this.maxItems);
    if (!merged) return false;
    this.items = merged;
    return true;
  }

  public insert(item?: QuadItem<TId> | Partial<QuadItem<TId>> | null): void {
    this.items = insertQuadTreeItem(
      this.nodes,
      this.items,
      this.bounds,
      this.maxItems,
      this.maxLevels,
      this.level,
      item,
      () => this.split(),
    );
  }

  public remove(id: TId): boolean {
    const res = removeQuadTreeItem(this.nodes, this.items, id);
    if (res) this.coalesce();
    return res;
  }

  public update(id: TId, newBounds: BoundingBox): boolean {
    if (!this.remove(id)) return false;
    this.insert({ id, bounds: newBounds });
    return true;
  }

  public visit(
    target: BoundingBox,
    visitor: (item: QuadItem<TId>) => boolean | void,
    seen?: Set<string>,
  ): boolean {
    return seen
      ? visitQuadTreeItems(this.nodes, this.items, this.bounds, target, visitor, seen)
      : withPooledSeen((s) =>
          visitQuadTreeItems(this.nodes, this.items, this.bounds, target, visitor, s),
        );
  }

  public retrieve(
    returnItems: QuadItem<TId>[] = [],
    bounds?: BoundingBox,
    seen?: Set<string>,
  ): QuadItem<TId>[] {
    const b = bounds ?? this.bounds;
    if (seen) queryQuadTreeItems(this.nodes, this.items, this.bounds, b, returnItems, seen);
    else
      withPooledSeen((s) =>
        queryQuadTreeItems(this.nodes, this.items, this.bounds, b, returnItems, s),
      );
    return returnItems;
  }

  public hasCollision(target: BoundingBox, excludeId?: TId): boolean {
    return hasCollisionInNodes(this.nodes, this.items, this.bounds, target, excludeId);
  }

  public findFirst(
    target: BoundingBox,
    predicate?: (item: QuadItem<TId>) => boolean,
  ): QuadItem<TId> | undefined {
    return findFirstInNodes(this.nodes, this.items, this.bounds, target, predicate);
  }

  public nearest(point: Point2D, maxDistance?: number): QuadItem<TId> | undefined {
    return findNearestQuadItem(this, point, maxDistance);
  }

  public dispose(): void {
    this.clear();
  }
  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
