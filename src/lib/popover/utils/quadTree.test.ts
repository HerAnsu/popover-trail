import { describe, it, expect } from 'vitest';
import { QuadTree, QuadItem } from './quadTree';

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

  it('splits into sub-quadrants when maxItems capacity is exceeded', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 });

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
    tree.clear();

    const results = tree.retrieve([], { x: 0, y: 0, width: 500, height: 500 });
    expect(results).toHaveLength(0);
  });

  it('handles items straddling quadrant split boundaries', () => {
    const tree = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2, 4);

    // Center straddling item (crosses both vertical and horizontal center lines)
    const centerItem: QuadItem = {
      id: 'center-popover',
      bounds: { x: 450, y: 450, width: 100, height: 100 },
    };

    tree.insert({ id: 'tl', bounds: { x: 10, y: 10, width: 50, height: 50 } });
    tree.insert({ id: 'tr', bounds: { x: 900, y: 10, width: 50, height: 50 } });
    tree.insert({ id: 'bl', bounds: { x: 10, y: 900, width: 50, height: 50 } });
    tree.insert(centerItem);

    // Retrieve in top-right quadrant
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
});
