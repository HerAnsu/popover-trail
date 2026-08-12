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
  private readonly maxItems = 4;
  private readonly maxLevels = 5;

  private readonly bounds: BoundingBox;
  private readonly level: number;

  constructor(bounds: BoundingBox, level = 0) {
    this.bounds = bounds;
    this.level = level;
  }

  /** Clears all items and child nodes. */
  clear(): void {
    this.items = [];
    for (const node of this.nodes) {
      node.clear();
    }
    this.nodes = [];
  }

  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const { x, y } = this.bounds;

    this.nodes[0] = new QuadTree(
      { x: x + subWidth, y, width: subWidth, height: subHeight },
      this.level + 1,
    );
    this.nodes[1] = new QuadTree({ x, y, width: subWidth, height: subHeight }, this.level + 1);
    this.nodes[2] = new QuadTree(
      { x, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1,
    );
    this.nodes[3] = new QuadTree(
      { x: x + subWidth, y: y + subHeight, width: subWidth, height: subHeight },
      this.level + 1,
    );
  }

  private getIndex(bounds: BoundingBox): number {
    let index = -1;
    const verticalMidpoint = this.bounds.x + this.bounds.width / 2;
    const horizontalMidpoint = this.bounds.y + this.bounds.height / 2;

    const topQuadrant =
      bounds.y < horizontalMidpoint && bounds.y + bounds.height < horizontalMidpoint;
    const bottomQuadrant = bounds.y > horizontalMidpoint;

    if (bounds.x < verticalMidpoint && bounds.x + bounds.width < verticalMidpoint) {
      if (topQuadrant) index = 1;
      else if (bottomQuadrant) index = 2;
    } else if (bounds.x > verticalMidpoint) {
      if (topQuadrant) index = 0;
      else if (bottomQuadrant) index = 3;
    }

    return index;
  }

  /** Inserts a QuadItem into the tree index. */
  insert(item: QuadItem): void {
    if (this.nodes.length > 0) {
      const index = this.getIndex(item.bounds);
      if (index !== -1) {
        this.nodes[index]?.insert(item);
        return;
      }
    }

    this.items.push(item);

    if (this.items.length > this.maxItems && this.level < this.maxLevels) {
      if (this.nodes.length === 0) {
        this.split();
      }

      let i = 0;
      while (i < this.items.length) {
        const currentItem = this.items[i];
        if (!currentItem) {
          i++;
          continue;
        }
        const index = this.getIndex(currentItem.bounds);
        if (index !== -1) {
          const removed = this.items.splice(i, 1)[0];
          if (removed) {
            this.nodes[index]?.insert(removed);
          }
        } else {
          i++;
        }
      }
    }
  }

  /** Retrieves items intersecting target bounds into returnItems without unnecessary allocations. */
  retrieve(returnItems: QuadItem[] = [], itemBounds?: BoundingBox): QuadItem[] {
    const targetBounds = itemBounds ?? this.bounds;

    if (this.nodes.length > 0) {
      const index = this.getIndex(targetBounds);
      if (index !== -1) {
        this.nodes[index]?.retrieve(returnItems, targetBounds);
      } else {
        for (const node of this.nodes) {
          if (boxesIntersect(node.bounds, targetBounds)) {
            node.retrieve(returnItems, targetBounds);
          }
        }
      }
    }

    for (const item of this.items) {
      if (item && item.id && boxesIntersect(item.bounds, targetBounds)) {
        returnItems.push(item);
      }
    }

    return returnItems;
  }
}
