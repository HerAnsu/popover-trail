/**
 * 2D QuadTree Spatial Partitioning Index for floating popover collision resolution.
 * Allows O(log N) bounding box overlap queries for pinned/floating cards.
 *
 * @module quadTree
 */

/** Bounding box rectangle dimensions. */
export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Item node stored within a QuadTree spatial region. */
export interface QuadItem {
  id: string;
  bounds: BoundingBox;
}

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return a.x < b.x + b.width && a.x + a.width > b.x && a.y < b.y + b.height && a.y + a.height > b.y;
}

/**
 * 2D QuadTree Spatial Partitioning Index.
 */
export class QuadTree {
  private items: QuadItem[] = [];
  private nodes: QuadTree[] = [];
  private readonly maxItems = 16;
  private readonly maxLevels = 8;

  private readonly bounds: BoundingBox;
  private readonly level: number;

  constructor(bounds: BoundingBox, level = 0) {
    this.bounds = bounds;
    this.level = level;
  }

  /** Clears all items and child nodes recursively. */
  clear(): void {
    this.items = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
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

    // Node 0: Top-Right (NE)
    this.nodes[0] = new QuadTree(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.level + 1,
    );
    // Node 1: Top-Left (NW)
    this.nodes[1] = new QuadTree({ x, y, width: subWidth, height: subHeight }, this.level + 1);
    // Node 2: Bottom-Left (SW)
    this.nodes[2] = new QuadTree(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1,
    );
    // Node 3: Bottom-Right (SE)
    this.nodes[3] = new QuadTree(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1,
    );
  }

  /**
   * Determines which child quadrant a given bounding box completely fits into.
   *
   * @param bounds - Target bounding box to locate.
   * @returns Quadrant index (0 = NE, 1 = NW, 2 = SW, 3 = SE), or -1 if the bounding box spans across the quadrant boundaries.
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

    // Straddles the boundary line; must remain in the parent node
    return -1;
  }

  /**
   * Pushes items down into child sub-quadrants when capacity is exceeded.
   * Items that span across quadrant boundaries remain in the parent node.
   */
  private redistributeItems(): void {
    if (this.nodes.length === 0) {
      this.split();
    }

    const remaining: QuadItem[] = [];
    for (const currentItem of this.items) {
      if (!currentItem) continue;
      const index = this.getIndex(currentItem.bounds);
      if (index !== -1) {
        this.nodes[index]?.insert(currentItem);
      } else {
        remaining.push(currentItem);
      }
    }
    this.items = remaining;
  }

  /**
   * Inserts a QuadItem into the tree index.
   * If the current node exceeds `maxItems` and hasn't reached `maxLevels`, it subdivides.
   */
  insert(item: QuadItem): void {
    if (!item || !item.bounds) return;
    if (this.nodes.length > 0) {
      const index = this.getIndex(item.bounds);
      if (index !== -1) {
        this.nodes[index]?.insert(item);
        return;
      }
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.level < this.maxLevels) {
      this.redistributeItems();
    }
  }

  /**
   * Helper that traverses child quadrants that intersect with targetBounds.
   */
  private retrieveFromChildren(
    targetBounds: BoundingBox,
    returnItems: QuadItem[],
    seenIds: Set<string>,
  ): void {
    const index = this.getIndex(targetBounds);
    if (index !== -1) {
      this.nodes[index]?.retrieve(returnItems, targetBounds, seenIds);
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
    returnItems: QuadItem[] = [],
    itemBounds?: BoundingBox,
    seenIds?: Set<string>,
  ): QuadItem[] {
    const targetBounds = itemBounds ?? this.bounds;
    const seen = seenIds ?? new Set<string>();

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
}
