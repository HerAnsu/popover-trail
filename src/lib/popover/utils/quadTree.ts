/**
 * 2D QuadTree Spatial Partitioning Index for floating popover collision resolution.
 * Allows O(log N) bounding box overlap queries for pinned/floating cards.
 */

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface QuadItem {
  id: string;
  bounds: BoundingBox;
}

function boxesIntersect(a: BoundingBox, b: BoundingBox): boolean {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

export class QuadTree {
  private items: QuadItem[] = [];
  private nodes: QuadTree[] = [];
  private maxItems = 4;
  private maxLevels = 5;

  private bounds: BoundingBox;
  private level: number;

  constructor(bounds: BoundingBox, level = 0) {
    this.bounds = bounds;
    this.level = level;
  }

  clear(): void {
    this.items = [];
    for (let i = 0; i < this.nodes.length; i++) {
      this.nodes[i]?.clear();
    }
    this.nodes = [];
  }

  private split(): void {
    const subWidth = this.bounds.width / 2;
    const subHeight = this.bounds.height / 2;
    const x = this.bounds.x;
    const y = this.bounds.y;

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

  retrieve(returnItems: QuadItem[], itemBounds: BoundingBox): QuadItem[] {
    const index = this.getIndex(itemBounds);
    if (index !== -1 && this.nodes.length > 0) {
      this.nodes[index]?.retrieve(returnItems, itemBounds);
    }

    for (let i = 0; i < this.items.length; i++) {
      const item = this.items[i];
      if (item && item.id && boxesIntersect(item.bounds, itemBounds)) {
        returnItems.push(item);
      }
    }

    return returnItems;
  }
}
