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
import { Ok, Err, type Result } from '../result';

/**
 * Diagnostic error payload returned when a spatial range query or KNN search finds no candidates.
 */
export interface SpatialNotFoundError {
  readonly type: 'spatial_not_found';
  /** Descriptive error message. */
  readonly message: string;
}

/**
 * 2D QuadTree spatial index for fast rectangular bounding box queries.
 *
 * Recursively partitions 2D screen space into four quadrants (`NE`, `NW`, `SW`, `SE`)
 * to speed up collision detection, overlap tests, and nearest-neighbor searches.
 * Rather than scanning every active popover card ($O(N)$), spatial queries prune non-overlapping
 * screen regions to run in $O(\log N)$ time.
 *
 * @template TId - Domain identifier type for indexed items (defaults to string).
 *
 * @example
 * ```typescript
 * const tree = new QuadTree({ x: 0, y: 0, width: 1920, height: 1080 });
 *
 * // Insert popover cards into spatial index
 * tree.insert({ id: 'card-1', bounds: { x: 100, y: 100, width: 200, height: 150 } });
 * tree.insert({ id: 'card-2', bounds: { x: 350, y: 100, width: 200, height: 150 } });
 *
 * // Test if candidate popover position collides with any existing card
 * const collides = tree.hasCollision({ x: 120, y: 120, width: 100, height: 100 });
 * console.log(collides); // true
 * ```
 */
export class QuadTree<TId extends string = string> {
  private items: QuadItem<TId>[] = [];
  private nodes: QuadTree<TId>[] = [];
  private readonly maxItems: number;
  private readonly maxLevels: number;
  readonly bounds: BoundingBox;
  private readonly level: number;

  /**
   * Initializes a QuadTree node.
   *
   * @param bounds - Spatial boundaries of this node.
   * @param maxItems - Threshold count before splitting into 4 sub-quadrants (default 16).
   * @param maxLevels - Maximum tree depth limit to prevent infinite subdivision (default 8).
   * @param level - Current depth tier of this node (root is 0).
   */
  constructor(bounds: BoundingBox, maxItems = 16, maxLevels = 8, level = 0) {
    this.bounds = sanitizeSpatialBounds(bounds);
    this.maxItems = isPositiveFinite(maxItems) ? maxItems : 16;
    this.maxLevels = isPositiveFinite(maxLevels) ? maxLevels : 8;
    this.level = isNonNegativeFinite(level) ? level : 0;
  }

  /**
   * Returns items stored directly in this QuadTree node (not including subdivided child quadrants).
   */
  public getItems(): readonly QuadItem<TId>[] {
    return this.items;
  }

  /**
   * Returns the four subdivided child quadrant nodes (`[ne, nw, sw, se]`), or an empty array if not subdivided.
   */
  public getNodes(): readonly QuadTree<TId>[] {
    return this.nodes;
  }

  /**
   * Maximum capacity threshold of items before this node subdivides into 4 quadrants.
   */
  public get maxItemsCapacity(): number {
    return this.maxItems;
  }

  /**
   * Maximum tree depth limit to prevent infinite recursive subdivisions.
   */
  public get maxLevelsLimit(): number {
    return this.maxLevels;
  }

  /**
   * Total count of all items stored in this node and all descendant quadrant subtrees.
   */
  public get size(): number {
    let count = this.items.length;
    for (const n of this.nodes) count += n.size;
    return count;
  }

  /**
   * Empties all items and recursively clears all child quadrant subtrees.
   */
  public clear(): void {
    this.items = [];
    for (const n of this.nodes) n.clear();
    this.nodes = [];
  }

  /**
   * Splits this quadrant node into four sub-quadrants: North-East, North-West, South-West, South-East.
   */
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

  /**
   * Attempts to collapse empty or sparsely populated child quadrants back into this parent node.
   *
   * @returns `true` if child quadrants were collapsed, `false` otherwise.
   */
  public coalesce(): boolean {
    const merged = tryCoalesceQuadTree(this.nodes, this.items, this.maxItems);
    if (!merged) return false;
    this.items = merged;
    return true;
  }

  /**
   * Inserts an item into the QuadTree, subdividing into quadrants if capacity is exceeded.
   *
   * @param item - Spatial item containing an `id` and `bounds` rectangle.
   *
   * @example
   * ```typescript
   * tree.insert({
   *   id: 'popover-1',
   *   bounds: { x: 100, y: 150, width: 250, height: 180 },
   * });
   * ```
   */
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

  /**
   * Removes an item by its unique ID, coalescing empty child quadrants if appropriate.
   *
   * @param id - Identifier of the item to remove.
   * @returns `true` if the item was found and removed, `false` otherwise.
   *
   * @example
   * ```typescript
   * tree.remove('popover-1');
   * ```
   */
  public remove(id: TId): boolean {
    const res = removeQuadTreeItem(this.nodes, this.items, id);
    if (res) this.coalesce();
    return res;
  }

  /**
   * Updates an existing item's spatial bounding box.
   *
   * @param id - Identifier of the item.
   * @param newBounds - Updated bounding box.
   * @returns `true` if updated, `false` if the item was not found.
   *
   * @example
   * ```typescript
   * tree.update('popover-1', { x: 120, y: 160, width: 250, height: 180 });
   * ```
   */
  public update(id: TId, newBounds: BoundingBox): boolean {
    if (!this.remove(id)) return false;
    this.insert({ id, bounds: newBounds });
    return true;
  }

  /**
   * Traverses all items intersecting the `target` box, executing `visitor` for each.
   *
   * If `visitor` returns `false`, traversal stops early.
   *
   * @param target - Search bounding box.
   * @param visitor - Callback invoked for each intersecting item.
   * @param seen - Optional set to deduplicate items spanning quadrant boundaries.
   * @returns `false` if stopped early, `true` otherwise.
   */
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

  /**
   * Retrieves all items that intersect with the specified bounding box.
   *
   * @param returnItems - Optional array to collect results into (reusable to avoid allocations).
   * @param bounds - Optional search box (defaults to entire tree bounds).
   * @param seen - Optional set for tracking visited IDs.
   * @returns Array containing intersecting items.
   *
   * @example
   * ```typescript
   * const overlapping = tree.retrieve([], { x: 50, y: 50, width: 200, height: 200 });
   * ```
   */
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

  /**
   * Checks whether any item in the tree intersects with the `target` bounding box.
   *
   * @param target - Target bounding box to test.
   * @param excludeId - Optional ID to ignore (e.g. self collision check).
   * @returns `true` if an intersection exists, `false` otherwise.
   *
   * @example
   * ```typescript
   * const collides = tree.hasCollision(candidateBox, 'current-dragged-card');
   * ```
   */
  public hasCollision(target: BoundingBox, excludeId?: TId): boolean {
    return hasCollisionInNodes(this.nodes, this.items, this.bounds, target, excludeId);
  }

  /**
   * Finds the first item intersecting the `target` box that matches the optional predicate.
   *
   * @param target - Search bounding box.
   * @param predicate - Optional filter function.
   * @returns First matching item or `undefined`.
   *
   * @example
   * ```typescript
   * const pinnedCard = tree.findFirst(searchArea, (item) => item.id.startsWith('pinned-'));
   * ```
   */
  public findFirst(
    target: BoundingBox,
    predicate?: (item: QuadItem<TId>) => boolean,
  ): QuadItem<TId> | undefined {
    return findFirstInNodes(this.nodes, this.items, this.bounds, target, predicate);
  }

  /**
   * Queries the tree for the first item intersecting the target bounding box that satisfies an optional predicate.
   *
   * @returns `Ok(QuadItem)` if found, or `Err(SpatialNotFoundError)` if no matching item exists.
   *
   * @example
   * ```typescript
   * const result = tree.findFirstResult(searchArea);
   * if (isOk(result)) {
   *   console.log('Found card:', result.data.id);
   * }
   * ```
   */
  public findFirstResult(
    target: BoundingBox,
    predicate?: (item: QuadItem<TId>) => boolean,
  ): Result<QuadItem<TId>, SpatialNotFoundError> {
    const item = this.findFirst(target, predicate);
    if (!item) {
      return Err({
        type: 'spatial_not_found',
        message: 'No spatial item matching the bounding box and predicate was found in QuadTree.',
      });
    }
    return Ok(item);
  }

  /**
   * Finds the nearest item in the tree to a 2D coordinate point within an optional max distance.
   *
   * @param point - Target 2D point (x, y).
   * @param maxDistance - Optional maximum search radius in pixels.
   * @returns Nearest item or `undefined`.
   *
   * @example
   * ```typescript
   * const closest = tree.nearest({ x: 400, y: 300 }, 150);
   * ```
   */
  public nearest(point: Point2D, maxDistance?: number): QuadItem<TId> | undefined {
    return findNearestQuadItem(this, point, maxDistance);
  }

  /**
   * Searches for the spatially nearest item to a 2D coordinate point within an optional maximum Euclidean radius.
   *
   * @param point - Target 2D point (x, y).
   * @param maxDistance - Optional maximum Euclidean distance threshold.
   * @returns `Ok(QuadItem)` if a candidate exists within radius, or `Err(SpatialNotFoundError)`.
   *
   * @example
   * ```typescript
   * const result = tree.nearestResult({ x: 400, y: 300 }, 100);
   * ```
   */
  public nearestResult(
    point: Point2D,
    maxDistance?: number,
  ): Result<QuadItem<TId>, SpatialNotFoundError> {
    const item = this.nearest(point, maxDistance);
    if (!item) {
      return Err({
        type: 'spatial_not_found',
        message: 'No nearest spatial item found in QuadTree within the specified distance.',
      });
    }
    return Ok(item);
  }

  public dispose(): void {
    this.clear();
  }
  public [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
