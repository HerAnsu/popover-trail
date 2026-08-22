/**
 * 2D QuadTree Spatial Partitioning Index for floating popover collision resolution.
 * Allows O(log N) bounding box overlap queries for pinned/floating cards.
 *
 * @module quadTree
 */

import { DISPOSE_SYMBOL } from './disposable';

/** Bounding box rectangle dimensions. */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Item node stored within a QuadTree spatial region.
 *
 * @template TId - Unique identifier type.
 */
export interface QuadItem<TId extends string = string> {
  id: TId;
  bounds: BoundingBox;
}

/**
 * Determines whether two bounding boxes intersect.
 * Correctly handles zero-dimension bounds (points and edges) using inclusive boundaries.
 */
export function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  if (!a || !b) return false;

  const isPointOrEdgeA = a.width === 0 || a.height === 0;
  const isPointOrEdgeB = b.width === 0 || b.height === 0;

  if (isPointOrEdgeA || isPointOrEdgeB) {
    return (
      a.x <= b.x + b.width && a.x + a.width >= b.x && a.y <= b.y + b.height && a.y + a.height >= b.y
    );
  }

  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

function isValidQuadItem<TId extends string = string>(item: unknown): item is QuadItem<TId> {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    Boolean((item as QuadItem<TId>).id) &&
    'bounds' in item &&
    typeof (item as QuadItem<TId>).bounds === 'object' &&
    (item as QuadItem<TId>).bounds !== null &&
    typeof (item as QuadItem<TId>).bounds.x === 'number' &&
    Number.isFinite((item as QuadItem<TId>).bounds.x) &&
    typeof (item as QuadItem<TId>).bounds.y === 'number' &&
    Number.isFinite((item as QuadItem<TId>).bounds.y) &&
    typeof (item as QuadItem<TId>).bounds.width === 'number' &&
    Number.isFinite((item as QuadItem<TId>).bounds.width) &&
    (item as QuadItem<TId>).bounds.width >= 0 &&
    typeof (item as QuadItem<TId>).bounds.height === 'number' &&
    Number.isFinite((item as QuadItem<TId>).bounds.height) &&
    (item as QuadItem<TId>).bounds.height >= 0
  );
}

/**
 * 2D QuadTree Spatial Partitioning Index.
 *
 * @template TId - Unique item identifier type.
 */
export class QuadTree<TId extends string = string> {
  private items: QuadItem<TId>[] = [];
  private nodes: QuadTree<TId>[] = [];
  private readonly maxItems: number;
  private readonly maxLevels: number;

  private readonly bounds: BoundingBox;
  private readonly level: number;

  /**
   * Initializes a 2D QuadTree spatial index.
   *
   * @param bounds - Spatial boundary bounding box.
   * @param maxItems - Max capacity of items per quadrant before subdivision (default: 16).
   * @param maxLevels - Max recursive quadrant subdivision depth (default: 8).
   * @param level - Internal current depth level (default: 0).
   */
  constructor(bounds: BoundingBox, maxItems = 16, maxLevels = 8, level = 0) {
    this.bounds = {
      x: Number.isFinite(bounds?.x) ? bounds.x : 0,
      y: Number.isFinite(bounds?.y) ? bounds.y : 0,
      width: Number.isFinite(bounds?.width) && bounds.width >= 0 ? bounds.width : 0,
      height: Number.isFinite(bounds?.height) && bounds.height >= 0 ? bounds.height : 0,
    };
    this.maxItems = Number.isFinite(maxItems) && maxItems > 0 ? maxItems : 16;
    this.maxLevels = Number.isFinite(maxLevels) && maxLevels > 0 ? maxLevels : 8;
    this.level = Number.isFinite(level) && level >= 0 ? level : 0;
  }

  /** Clears all items and child nodes recursively. */
  clear(): void {
    this.items = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  /** Total count of items indexed across this node and all sub-quadrants. */
  get size(): number {
    let count = this.items.length;
    for (const node of this.nodes) {
      count += node.size;
    }
    return count;
  }

  /**
   * Subdivides the current node's 2D space into 4 equal child quadrants:
   * Node 0: Top-Right (North-East)
   * Node 1: Top-Left (North-West)
   * Node 2: Bottom-Left (South-West)
   * Node 3: Bottom-Right (South-East)
   */
  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const { x, y } = this.bounds;
    const nextLevel = this.level + 1;

    // Node 0: Top-Right (NE)
    this.nodes[0] = new QuadTree<TId>(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.maxItems,
      this.maxLevels,
      nextLevel,
    );
    // Node 1: Top-Left (NW)
    this.nodes[1] = new QuadTree<TId>(
      { x, y, width: subWidth, height: subHeight },
      this.maxItems,
      this.maxLevels,
      nextLevel,
    );
    // Node 2: Bottom-Left (SW)
    this.nodes[2] = new QuadTree<TId>(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxItems,
      this.maxLevels,
      nextLevel,
    );
    // Node 3: Bottom-Right (SE)
    this.nodes[3] = new QuadTree<TId>(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.maxItems,
      this.maxLevels,
      nextLevel,
    );
  }

  /**
   * Determines which child quadrant a given bounding box completely fits into.
   *
   * @param bounds - Target bounding box to locate.
   * @returns Quadrant index (0 = NE, 1 = NW, 2 = SW, 3 = SE), or -1 if spanning boundaries.
   */
  private getIndex(bounds: BoundingBox): number {
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const fitsTop = bounds.y + bounds.height <= horizontalMidpoint;
    const fitsBottom = bounds.y >= horizontalMidpoint;
    const fitsLeft = bounds.x + bounds.width <= verticalMidpoint;
    const fitsRight = bounds.x >= verticalMidpoint;

    if (fitsLeft) {
      if (fitsTop) return 1; // NW quadrant
      if (fitsBottom) return 2; // SW quadrant
    } else if (fitsRight) {
      if (fitsTop) return 0; // NE quadrant
      if (fitsBottom) return 3; // SE quadrant
    }

    // Straddles quadrant midpoint boundaries; must stay in parent node
    return -1;
  }

  /**
   * Pushes items down into child sub-quadrants when capacity is exceeded.
   */
  private redistributeItems(): void {
    if (this.nodes.length === 0) {
      this.split();
    }

    const remaining: QuadItem<TId>[] = [];
    for (const currentItem of this.items) {
      if (!currentItem || !currentItem.bounds) continue;
      const index = this.getIndex(currentItem.bounds);
      if (index !== -1 && this.nodes[index]) {
        this.nodes[index].insert(currentItem);
      } else {
        remaining.push(currentItem);
      }
    }
    this.items = remaining;
  }

  /**
   * Inserts a QuadItem into the tree index.
   */
  insert(item?: QuadItem<TId> | Partial<QuadItem<TId>> | null): void {
    if (!isValidQuadItem<TId>(item)) return;

    if (this.nodes.length > 0) {
      const index = this.getIndex(item.bounds);
      if (index !== -1 && this.nodes[index]) {
        this.nodes[index].insert(item);
        return;
      }
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.level < this.maxLevels) {
      this.redistributeItems();
    }
  }

  /**
   * Removes a specific item by its unique ID from the QuadTree index.
   *
   * @param id - Item unique identifier.
   * @returns True if item was found and removed.
   */
  remove(id: TId): boolean {
    if (!id) return false;

    const itemIdx = this.items.findIndex((item) => item.id === id);
    if (itemIdx !== -1) {
      this.items.splice(itemIdx, 1);
      return true;
    }

    for (const node of this.nodes) {
      if (node.remove(id)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Helper that traverses child quadrants that intersect with targetBounds.
   */
  private retrieveFromChildren(
    targetBounds: BoundingBox,
    returnItems: QuadItem<TId>[],
    seenIds: Set<TId>,
  ): void {
    const index = this.getIndex(targetBounds);
    if (index !== -1 && this.nodes[index]) {
      this.nodes[index].retrieve(returnItems, targetBounds, seenIds);
      return;
    }

    for (const node of this.nodes) {
      if (boxesIntersect(node.bounds, targetBounds)) {
        node.retrieve(returnItems, targetBounds, seenIds);
      }
    }
  }

  /**
   * Retrieves all items that intersect with target bounds in O(log N) average time.
   * Uses a mutable accumulator array and Set to prevent GC allocations during render/drag loops.
   *
   * @param returnItems - Accumulator array to populate with colliding items.
   * @param itemBounds - Target search area (defaults to entire tree bounds).
   * @param seenIds - Deduplication set to avoid duplicate items.
   * @returns Populated accumulator array with matching items.
   */
  retrieve(
    returnItems: QuadItem<TId>[] = [],
    itemBounds?: BoundingBox,
    seenIds?: Set<TId>,
  ): QuadItem<TId>[] {
    const targetBounds = itemBounds ?? this.bounds;
    const seen = seenIds ?? new Set<TId>();

    if (this.nodes.length > 0) {
      this.retrieveFromChildren(targetBounds, returnItems, seen);
    }

    for (const item of this.items) {
      if (item && item.id && !seen.has(item.id) && boxesIntersect(item.bounds, targetBounds)) {
        seen.add(item.id);
        returnItems.push(item);
      }
    }

    return returnItems;
  }

  /** ScopeDisposable handle clearing all quad partitions. */
  dispose(): void {
    this.clear();
  }

  [DISPOSE_SYMBOL](): void {
    this.dispose();
  }
}
