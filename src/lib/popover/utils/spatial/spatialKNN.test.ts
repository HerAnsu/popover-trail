import { describe, it, expect } from 'vitest';
import { findMagneticSnap, findNearestQuadItem } from './spatialKNN';
import { QuadTree } from './quadTreeCore';

describe('spatialKNN', () => {
  describe('findNearestQuadItem', () => {
    it('returns undefined when QuadTree is empty', () => {
      const tree = new QuadTree({ x: 0, y: 0, width: 500, height: 500 });
      expect(findNearestQuadItem(tree, { x: 100, y: 100 })).toBeUndefined();
    });

    it('identifies nearest item across subdivided quadtree nodes using Euclidean distance', () => {
      const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2, 3);
      tree.insert({ id: 'nw-item', bounds: { x: 50, y: 50, width: 20, height: 20 } });
      tree.insert({ id: 'ne-item', bounds: { x: 700, y: 50, width: 20, height: 20 } });
      tree.insert({ id: 'se-item', bounds: { x: 800, y: 800, width: 20, height: 20 } });
      tree.insert({ id: 'sw-item', bounds: { x: 50, y: 800, width: 20, height: 20 } });

      const nearestToNW = findNearestQuadItem(tree, { x: 60, y: 60 });
      expect(nearestToNW?.id).toBe('nw-item');

      const nearestToSE = findNearestQuadItem(tree, { x: 790, y: 790 });
      expect(nearestToSE?.id).toBe('se-item');
    });

    it('prunes branches and respects maxDistance threshold', () => {
      const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
      tree.insert({ id: 'far', bounds: { x: 500, y: 500, width: 20, height: 20 } });

      expect(findNearestQuadItem(tree, { x: 10, y: 10 }, 50)).toBeUndefined();
      expect(findNearestQuadItem(tree, { x: 490, y: 490 }, 50)?.id).toBe('far');
    });

    it('returns 0 distance match when point falls directly inside item bounds', () => {
      const tree = new QuadTree({ x: 0, y: 0, width: 200, height: 200 });
      tree.insert({ id: 'target', bounds: { x: 30, y: 30, width: 40, height: 40 } });

      const result = findNearestQuadItem(tree, { x: 50, y: 50 });
      expect(result?.id).toBe('target');
    });
  });

  describe('findMagneticSnap', () => {
    const obstacle = { x: 100, y: 100, width: 100, height: 100 };

    it('snaps card left to obstacle right and top to obstacle bottom', () => {
      // card at (205, 205), near obstacle right (200) and bottom (200)
      const card = { x: 205, y: 205, width: 50, height: 50 };
      const snap = findMagneticSnap(card, [obstacle], 12);
      expect(snap.snapX).toBe(200);
      expect(snap.snapY).toBe(200);
    });

    it('snaps card right to obstacle left and bottom to obstacle top', () => {
      // card at (45, 45) with size 50 => right is 95 (near 100), bottom is 95 (near 100)
      // snapX = o.x - bw = 100 - 50 = 50
      // snapY = o.y - bh = 100 - 50 = 50
      const card = { x: 48, y: 48, width: 50, height: 50 };
      const snap = findMagneticSnap(card, [obstacle], 10);
      expect(snap.snapX).toBe(50);
      expect(snap.snapY).toBe(50);
    });

    it('aligns parallel edges (left-to-left and right-to-right)', () => {
      // card at (103, 150) -> near obstacle.x (100)
      const cardLeftAlign = { x: 103, y: 150, width: 40, height: 40 };
      const snapLeft = findMagneticSnap(cardLeftAlign, [obstacle], 10);
      expect(snapLeft.snapX).toBe(100);

      // card right at 202 (x = 152, width = 50) -> near obstacle right (200)
      // cX3 = 100 + 100 - 50 = 150
      const cardRightAlign = { x: 152, y: 150, width: 50, height: 50 };
      const snapRight = findMagneticSnap(cardRightAlign, [obstacle], 10);
      expect(snapRight.snapX).toBe(150);
    });

    it('returns undefined when beyond threshold or when obstacles list is empty', () => {
      const card = { x: 500, y: 500, width: 50, height: 50 };
      const snap = findMagneticSnap(card, [obstacle], 10);
      expect(snap.snapX).toBeUndefined();
      expect(snap.snapY).toBeUndefined();

      const emptySnap = findMagneticSnap(card, []);
      expect(emptySnap.snapX).toBeUndefined();
      expect(emptySnap.snapY).toBeUndefined();
    });
  });
});
