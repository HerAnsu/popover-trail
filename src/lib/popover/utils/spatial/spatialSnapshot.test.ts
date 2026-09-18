import { describe, it, expect } from 'vitest';
import { QuadTree } from './quadTreeCore';
import { exportSpatialSnapshot, importSpatialSnapshot } from './spatialSnapshot';

describe('spatialSnapshot', () => {
  it('exports and imports spatial tree preserving items and structure', () => {
    const original = new QuadTree({ x: 0, y: 0, width: 1000, height: 1000 }, 2, 4);
    original.insert({ id: 'p1', bounds: { x: 10, y: 10, width: 20, height: 20 } });
    original.insert({ id: 'p2', bounds: { x: 600, y: 600, width: 30, height: 30 } });

    const snapshot = exportSpatialSnapshot(original);
    expect(snapshot.bounds).toEqual({ x: 0, y: 0, width: 1000, height: 1000 });
    expect(snapshot.maxItems).toBe(2);
    expect(snapshot.maxLevels).toBe(4);
    expect(snapshot.items).toHaveLength(2);

    const restored = importSpatialSnapshot(snapshot);
    expect(restored).not.toBeNull();
    expect(restored?.size).toBe(2);

    const hits = restored?.retrieve([], { x: 0, y: 0, width: 50, height: 50 });
    expect(hits).toHaveLength(1);
    expect(hits?.[0]?.id).toBe('p1');
  });

  it('safely handles null and invalid snapshots', () => {
    expect(importSpatialSnapshot(null)).toBeNull();
    expect(importSpatialSnapshot(undefined)).toBeNull();
    expect(
      importSpatialSnapshot({} as unknown as Parameters<typeof importSpatialSnapshot>[0]),
    ).toBeNull();
  });
});
