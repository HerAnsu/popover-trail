/**
 * 2D QuadTree Hierarchical Spatial Index Engine.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @remarks
 * **Contributor Architectural Guide**:
 * - **Hierarchical Spatial Partitioning**: Recursively divides 2D space into four quadrants ($NE, NW, SW, SE$).
 *   Reduces pairwise collision testing from $O(N^2)$ to $O(N \log N)$ during cascade placement and drag operations.
 * - **Asymptotic Complexity**:
 *   - Insertion / Deletion: $O(\log N)$ average, bounded by `maxLevels` depth.
 *   - Range Queries: $O(K + \log N)$ where $K$ is the number of overlapping items. Non-intersecting quadrants are pruned.
 *   - K-Nearest Neighbors (KNN): Branch-and-bound euclidean distance search with dynamic radius shrinkage.
 * - **Automatic Coalescing**: When items are removed and the total count across child quadrants falls below `maxItems`,
 *   subtrees are pruned and coalesced back into the parent node to prevent sparse memory fragmentation.
 * - **Zero-GC Hot Path**: Range queries and collision checks borrow deduplication sets from `sharedSetPool`
 *   via `withPooledSeen()`, eliminating allocation overhead during dragging and animations.
 * - **RAII Lifecycle**: Conforms to `[DISPOSE_SYMBOL]` for deterministic recursive teardown.
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
 * @template TId - Domain identifier type for indexed items (defaults to string).
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
   */
  public update(id: TId, newBounds: BoundingBox): boolean {
    if (!this.remove(id)) return false;
    this.insert({ id, bounds: newBounds });
    return true;
  }

  /**
   * Traverses all items intersecting the `target` box, executing `visitor` for each.
   *
   * @remarks
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
