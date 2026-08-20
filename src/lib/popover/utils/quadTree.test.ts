import { describe, it, expect } from 'vitest';
import { QuadTree, type QuadItem, boxesIntersect } from './quadTree';

describe('QuadTree utility', () => {
  it('inserts items and retrieves intersecting items', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });

    const item1: QuadItem = { id: 'card-1', bounds: { x: 10, y: 10, width: 50, height: 50 } };
    const item2: QuadItem = { id: 'card-2', bounds: { x: 500, y: 500, width: 100, height: 100 } };

    tree.insert(item1);
    tree.insert(item2);

    const queryArea = { x: 0, y: 0, width: 100, height: 100 };
    const results = tree.retrieve([], queryArea);

    expect(results).toHaveLength(1);
    expect(results[0]?.id).toBe('card-1');
  });

  it('correctly handles zero-dimension point bounds (width: 0, height: 0) and edge points at (0, 0)', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });

    // Zero-dimension point at (0, 0)
    tree.insert({ id: 'point-origin', bounds: { x: 0, y: 0, width: 0, height: 0 } });
    // Zero-dimension point at (50, 50)
    tree.insert({ id: 'point-center', bounds: { x: 50, y: 50, width: 0, height: 0 } });

    // Query area covering (0,0) to (100,100)
    const results = tree.retrieve([], { x: 0, y: 0, width: 100, height: 100 });
    const ids = results.map((r) => r.id);

    expect(ids).toContain('point-origin');
    expect(ids).toContain('point-center');

    // Test direct boxesIntersect with points
    expect(
      boxesIntersect({ x: 0, y: 0, width: 0, height: 0 }, { x: 0, y: 0, width: 100, height: 100 }),
    ).toBe(true);
  });

  it('splits into sub-quadrants when maxItems capacity is exceeded', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 4);

    for (let i = 0; i < 10; i++) {
      tree.insert({
        id: `card-${i}`,
        bounds: { x: i * 20, y: i * 20, width: 15, height: 15 },
      });
    }

    const results = tree.retrieve([], { x: 0, y: 0, width: 50, height: 50 });
    expect(results.length).toBeGreaterThan(0);
  });

  it('clears all items and nodes', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 500, height: 500 });
    tree.insert({ id: 'card-1', bounds: { x: 10, y: 10, width: 20, height: 20 } });
    expect(tree.size).toBe(1);

    tree.clear();
    expect(tree.size).toBe(0);

    const results = tree.retrieve([], { x: 0, y: 0, width: 500, height: 500 });
    expect(results).toHaveLength(0);
  });

  it('supports removing specific items via remove(id)', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 500, height: 500 }, 2);
    tree.insert({ id: 'item-a', bounds: { x: 10, y: 10, width: 30, height: 30 } });
    tree.insert({ id: 'item-b', bounds: { x: 300, y: 300, width: 30, height: 30 } });

    expect(tree.size).toBe(2);

    const removed = tree.remove('item-a');
    expect(removed).toBe(true);
    expect(tree.size).toBe(1);

    const results = tree.retrieve([], { x: 0, y: 0, width: 100, height: 100 });
    expect(results).toHaveLength(0);
  });

  it('handles items straddling quadrant split boundaries', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2, 4);

    const centerItem: QuadItem = {
      id: 'center-popover',
      bounds: { x: 450, y: 450, width: 100, height: 100 },
    };

    tree.insert({ id: 'tl', bounds: { x: 10, y: 10, width: 50, height: 50 } });
    tree.insert({ id: 'tr', bounds: { x: 900, y: 10, width: 50, height: 50 } });
    tree.insert({ id: 'bl', bounds: { x: 10, y: 900, width: 50, height: 50 } });
    tree.insert(centerItem);

    const trResults = tree.retrieve([], { x: 500, y: 0, width: 500, height: 500 });
    const trIds = trResults.map((item) => item.id);
    expect(trIds).toContain('center-popover');
    expect(trIds).toContain('tr');
  });

  it('handles 100 inserted popover cards with multi-level quadrant splitting', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 2000, height: 2000 }, 4, 5);

    for (let i = 0; i < 100; i++) {
      tree.insert({
        id: `popover-${i}`,
        bounds: { x: (i * 19) % 1900, y: (i * 17) % 1900, width: 40, height: 40 },
      });
    }

    const queryResults = tree.retrieve([], { x: 0, y: 0, width: 200, height: 200 });
    expect(queryResults.length).toBeGreaterThan(0);
    expect(queryResults.length).toBeLessThan(100);
  });

  it('returns empty set when querying non-overlapping region', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });
    tree.insert({ id: 'popover-1', bounds: { x: 100, y: 100, width: 50, height: 50 } });

    const results = tree.retrieve([], { x: 800, y: 800, width: 100, height: 100 });
    expect(results).toHaveLength(0);
  });

  it('safely ignores null or invalid items and supports dispose', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 500, height: 500 });
    tree.insert(null);
    tree.insert({ id: 'bad' });
    expect(tree.retrieve()).toHaveLength(0);

    tree.insert({ id: 'good', bounds: { x: 10, y: 10, width: 20, height: 20 } });
    expect(tree.retrieve()).toHaveLength(1);

    tree.dispose();
    expect(tree.retrieve()).toHaveLength(0);
  });
});
