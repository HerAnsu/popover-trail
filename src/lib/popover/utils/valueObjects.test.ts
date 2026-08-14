import { describe, it, expect } from 'vitest';
import { Point2D, RectBounds } from './valueObjects';

describe('Geometry Value Objects', () => {
  describe('Point2D', () => {
    it('creates zero vector by default or with zero()', () => {
      const p1 = Point2D.zero();
      expect(p1.x).toBe(0);
      expect(p1.y).toBe(0);
    });

    it('guards against NaN and Infinity values', () => {
      const p = Point2D.of(Number.NaN, Infinity);
      expect(p.x).toBe(0);
      expect(p.y).toBe(0);
    });

    it('supports immutable addition, subtraction and clamping', () => {
      const p1 = Point2D.of(10, 20);
      const p2 = Point2D.of(5, -5);

      const added = p1.add(p2);
      expect(added.x).toBe(15);
      expect(added.y).toBe(15);

      const subtracted = p1.subtract(p2);
      expect(subtracted.x).toBe(5);
      expect(subtracted.y).toBe(25);

      const clamped = p1.clamp(0, 8, 0, 15);
      expect(clamped.x).toBe(8);
      expect(clamped.y).toBe(15);
    });

    it('checks equality correctly', () => {
      const p1 = Point2D.of(10, 20);
      expect(p1.equals({ x: 10, y: 20 })).toBe(true);
      expect(p1.equals({ x: 10, y: 21 })).toBe(false);
    });
  });

  describe('RectBounds', () => {
    it('creates bounds with safe numbers', () => {
      const rect = RectBounds.of(10, 20, 100, 200);
      expect(rect.top).toBe(10);
      expect(rect.left).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(200);
      expect(rect.right).toBe(120);
      expect(rect.bottom).toBe(210);
    });

    it('calculates center point correctly', () => {
      const rect = RectBounds.of(10, 20, 100, 200);
      const center = rect.center;
      expect(center.x).toBe(70);
      expect(center.y).toBe(110);
    });

    it('checks point containment and rect intersection', () => {
      const r1 = RectBounds.of(0, 0, 100, 100);
      expect(r1.contains({ x: 50, y: 50 })).toBe(true);
      expect(r1.contains({ x: 150, y: 50 })).toBe(false);

      const r2 = RectBounds.of(50, 50, 100, 100);
      expect(r1.intersects(r2)).toBe(true);

      const r3 = RectBounds.of(200, 200, 100, 100);
      expect(r1.intersects(r3)).toBe(false);

      expect(r1.contains(null as unknown as { x: number; y: number })).toBe(false);
      expect(r1.intersects(null as unknown as RectBounds)).toBe(false);
    });

    it('computes distance between two points', () => {
      const p1 = Point2D.of(0, 0);
      const p2 = Point2D.of(3, 4);
      expect(p1.distanceTo(p2)).toBe(5);
    });

    it('converts to and from plain objects and DOMRect', () => {
      const p = Point2D.fromObject({ x: 12, y: 34 });
      expect(p.toObject()).toEqual({ x: 12, y: 34 });

      const domRectLike = {
        x: 10,
        y: 20,
        width: 100,
        height: 50,
        top: 20,
        left: 10,
        right: 110,
        bottom: 70,
        toJSON: () => ({}),
      } as unknown as DOMRect;
      const bounds = RectBounds.fromDOMRect(domRectLike);
      expect(bounds.left).toBe(10);
      expect(bounds.top).toBe(20);
      expect(bounds.width).toBe(100);
      expect(bounds.height).toBe(50);

      const exportedDomRect = bounds.toDOMRect();
      expect(exportedDomRect.x).toBe(10);
      expect(exportedDomRect.y).toBe(20);
      expect(exportedDomRect.width).toBe(100);
      expect(exportedDomRect.height).toBe(50);
    });
  });
});
