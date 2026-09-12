import { describe, it, expect } from 'vitest';
import { sharedPointPool, sharedBoxPool, sharedSetPool } from './spatialPools';
import { globalPoolRegistry } from './poolRegistry';
import { createMagneticSnapModifier } from '../../dnd/dndSnap';
import { isCursorInSafeTriangle } from '../spatial/spatialCorridor';
import { selectLowestEnergyPlacement, computeCascadeOverlapEnergy } from '../spatial/spatialEnergy';
import { QuadTree } from '../spatial/quadTreeCore';

describe('Spatial Pools Deep Integration', () => {
  it('dndSnap borrows and releases sharedBoxPool with zero leaks', () => {
    const hitsBefore = sharedBoxPool.getMetrics().hits;
    const modifier = createMagneticSnapModifier(
      () => [{ id: 'obstacle-1', rect: { x: 100, y: 100, width: 50, height: 50 } }],
      15,
    );

    const activeNodeRect = {
      left: 145,
      top: 100,
      width: 40,
      height: 40,
      bottom: 140,
      right: 185,
    };

    const res = modifier({
      transform: { x: 0, y: 0, scaleX: 1, scaleY: 1 },
      activeNodeRect,
      active: {
        id: 'moving-node',
        data: { current: undefined },
        rect: { current: { initial: null, translated: null } },
      },
      activatorEvent: null as unknown as Event,
      draggingNodeRect: null,
      containerNodeRect: null,
      over: null,
      overlayNodeRect: null,
      scrollableAncestors: [],
      scrollableAncestorRects: [],
      windowRect: null,
    });

    expect(sharedBoxPool.getMetrics().hits).toBeGreaterThan(hitsBefore);
    expect(sharedBoxPool.inUse).toBe(0);
    expect(res.x).toBe(5); // 150 (obstacle right edge) - 145 = 5
  });

  it('spatialCorridor borrows and releases sharedPointPool with zero leaks', () => {
    const hitsBefore = sharedPointPool.getMetrics().hits;
    const cursor = { x: 120, y: 120 };
    const anchor = { x: 50, y: 50 };
    const targetBounds = { x: 100, y: 100, width: 100, height: 100 };

    const inside = isCursorInSafeTriangle(cursor, anchor, targetBounds);
    expect(typeof inside).toBe('boolean');
    expect(sharedPointPool.getMetrics().hits).toBeGreaterThanOrEqual(hitsBefore + 2);
    expect(sharedPointPool.inUse).toBe(0);
  });

  it('spatialEnergy placement optimization uses sharedBoxPool without leaking', () => {
    const hitsBefore = sharedBoxPool.getMetrics().hits;
    const candidates = [
      { x: 100, y: 100 },
      { x: 200, y: 200 },
      { x: 300, y: 300 },
    ];
    const size = { width: 50, height: 50 };
    const obstacles = [{ x: 100, y: 100, width: 60, height: 60 }];
    const preferred = { x: 300, y: 300 };

    const best = selectLowestEnergyPlacement(candidates, size, obstacles, preferred);
    expect(best).toEqual({ x: 300, y: 300 });
    expect(sharedBoxPool.getMetrics().hits).toBeGreaterThan(hitsBefore);
    expect(sharedBoxPool.inUse).toBe(0);

    const firstCandidate = candidates[0];
    if (firstCandidate) {
      const energy = computeCascadeOverlapEnergy(firstCandidate, size, obstacles, preferred);
      expect(typeof energy).toBe('number');
    }
    expect(sharedBoxPool.inUse).toBe(0);
  });

  it('QuadTree queries use sharedSetPool with zero leaks', () => {
    const hitsBefore = sharedSetPool.getMetrics().hits;
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
    tree.insert({ id: 'item-1', bounds: { x: 10, y: 10, width: 20, height: 20 } });
    tree.insert({ id: 'item-2', bounds: { x: 50, y: 50, width: 20, height: 20 } });

    const hasCollision = tree.hasCollision({ x: 15, y: 15, width: 10, height: 10 });
    expect(hasCollision).toBe(true);

    const match = tree.findFirst({ x: 55, y: 55, width: 10, height: 10 });
    expect(match?.id).toBe('item-2');

    const visited: string[] = [];
    tree.visit({ x: 0, y: 0, width: 100, height: 100 }, (item) => {
      visited.push(item.id);
    });
    expect(visited).toContain('item-1');
    expect(visited).toContain('item-2');

    const retrieved = tree.retrieve();
    expect(retrieved).toHaveLength(2);

    expect(sharedSetPool.getMetrics().hits).toBeGreaterThanOrEqual(hitsBefore + 4);
    expect(sharedSetPool.inUse).toBe(0);
  });

  it('sustains 1000 high-frequency iterations with zero pool leaks', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
    tree.insert({ id: 'c1', bounds: { x: 100, y: 100, width: 50, height: 50 } });

    for (let i = 0; i < 1000; i++) {
      tree.hasCollision({ x: 110, y: 110, width: 10, height: 10 });
      isCursorInSafeTriangle(
        { x: 50, y: 50 },
        { x: 0, y: 0 },
        { x: 40, y: 40, width: 50, height: 50 },
      );
      computeCascadeOverlapEnergy({ x: 100, y: 100 }, { width: 50, height: 50 }, [], {
        x: 100,
        y: 100,
      });
    }

    expect(sharedPointPool.inUse).toBe(0);
    expect(sharedBoxPool.inUse).toBe(0);
    expect(sharedSetPool.inUse).toBe(0);

    const agg = globalPoolRegistry.getAggregatedMetrics();
    expect(agg.totalInUse).toBe(0);
  });
});
