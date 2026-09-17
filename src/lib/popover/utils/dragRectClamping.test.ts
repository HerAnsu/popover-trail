import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  clampCoordinateToBounds,
  clampToContainer,
  clampToViewport,
  computeBoundaryProximityRatio,
} from './dragRectClamping';
import type { DragTransform2D, DragNodeRect, DragBoundsRect } from './dragBounds';

describe('dragRectClamping', () => {
  const defaultTransform: DragTransform2D = {
    x: 0,
    y: 0,
    scaleX: 1.2,
    scaleY: 1.2,
  };

  const activeNode: DragNodeRect = {
    top: 50,
    left: 50,
    bottom: 150,
    right: 150,
    width: 100,
    height: 100,
  };

  describe('clampCoordinateToBounds', () => {
    const bounds: DragBoundsRect = {
      left: 0,
      top: 0,
      right: 500,
      bottom: 500,
    };

    it('retains transform coordinates when node remains strictly inside bounds', () => {
      const transform: DragTransform2D = { ...defaultTransform, x: 20, y: 30 };
      const clamped = clampCoordinateToBounds(transform, activeNode, bounds);

      expect(clamped.x).toBe(20);
      expect(clamped.y).toBe(30);
      expect(clamped.scaleX).toBe(1.2);
      expect(clamped.scaleY).toBe(1.2);
    });

    it('clamps transform to minimum when dragging past top-left bounds', () => {
      // minX = 0 - 50 = -50, minY = 0 - 50 = -50
      const transform: DragTransform2D = { ...defaultTransform, x: -100, y: -200 };
      const clamped = clampCoordinateToBounds(transform, activeNode, bounds);

      expect(clamped.x).toBe(-50);
      expect(clamped.y).toBe(-50);
    });

    it('clamps transform to maximum when dragging past bottom-right bounds', () => {
      // maxX = 500 - 50 - 100 = 350
      // maxY = 500 - 50 - 100 = 350
      const transform: DragTransform2D = { ...defaultTransform, x: 600, y: 700 };
      const clamped = clampCoordinateToBounds(transform, activeNode, bounds);

      expect(clamped.x).toBe(350);
      expect(clamped.y).toBe(350);
    });

    it('handles oversized active node where node width exceeds container bounds', () => {
      const hugeNode: DragNodeRect = {
        top: 0,
        left: 0,
        bottom: 600,
        right: 600,
        width: 600,
        height: 600,
      };
      // minX = 0 - 0 = 0, maxX = 500 - 0 - 600 = -100. Math.max(minX, Math.min(maxX, x)) -> 0
      const clamped = clampCoordinateToBounds(defaultTransform, hugeNode, bounds);
      expect(clamped.x).toBe(0);
      expect(clamped.y).toBe(0);
    });
  });

  describe('clampToContainer', () => {
    it('restricts transform to arbitrary container rectangle', () => {
      const container = { top: 100, left: 100, right: 400, bottom: 400 };
      // node left is 50 -> minX = 100 - 50 = 50
      // maxX = 400 - 50 - 100 = 250
      const transform: DragTransform2D = { ...defaultTransform, x: 0, y: 500 };
      const clamped = clampToContainer(transform, activeNode, container);

      expect(clamped.x).toBe(50);
      expect(clamped.y).toBe(250);
    });
  });

  describe('clampToViewport', () => {
    beforeEach(() => {
      vi.stubGlobal('window', {
        innerWidth: 1000,
        innerHeight: 800,
      });
    });

    afterEach(() => {
      vi.unstubAllGlobals();
    });

    it('clamps coordinates relative to window viewport dimensions', () => {
      // minX = -50, maxX = 1000 - 50 - 100 = 850
      // minY = -50, maxY = 800 - 50 - 100 = 650
      const outsideTransform: DragTransform2D = { ...defaultTransform, x: 1200, y: 900 };
      const clamped = clampToViewport(outsideTransform, activeNode);

      expect(clamped.x).toBe(850);
      expect(clamped.y).toBe(650);
      expect(clamped.scaleX).toBe(1.2);
    });
  });

  describe('computeBoundaryProximityRatio', () => {
    it('calculates normalized ratio within boundary bounds', () => {
      expect(computeBoundaryProximityRatio(50, 0, 100)).toBe(0.5);
      expect(computeBoundaryProximityRatio(0, 0, 100)).toBe(0);
      expect(computeBoundaryProximityRatio(100, 0, 100)).toBe(1);
    });

    it('clamps ratio outside range to [0, 1]', () => {
      expect(computeBoundaryProximityRatio(-20, 0, 100)).toBe(0);
      expect(computeBoundaryProximityRatio(150, 0, 100)).toBe(1);
    });
  });
});
