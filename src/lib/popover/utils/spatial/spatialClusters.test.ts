import { describe, it, expect } from 'vitest';
import { findSpatialClusters } from './spatialClusters';
import type { QuadItem } from '../guards/spatialGuards';

describe('spatialClusters', () => {
  it('returns empty array when provided no items', () => {
    expect(findSpatialClusters([])).toEqual([]);
  });

  it('wraps a single isolated item into its own cluster', () => {
    const single: QuadItem<string>[] = [
      { id: 'solo', bounds: { x: 10, y: 20, width: 30, height: 40 } },
    ];
    const clusters = findSpatialClusters(single);

    expect(clusters).toHaveLength(1);
    expect(clusters[0]?.items).toHaveLength(1);
    expect(clusters[0]?.bounds).toEqual({ x: 10, y: 20, width: 30, height: 40 });
  });

  it('separates disjoint bounding boxes into distinct independent clusters', () => {
    const items: QuadItem<string>[] = [
      { id: 'box-1', bounds: { x: 0, y: 0, width: 50, height: 50 } },
      { id: 'box-2', bounds: { x: 200, y: 200, width: 50, height: 50 } },
      { id: 'box-3', bounds: { x: 500, y: 500, width: 50, height: 50 } },
    ];

    const clusters = findSpatialClusters(items);
    expect(clusters).toHaveLength(3);
    for (const cluster of clusters) {
      expect(cluster.items).toHaveLength(1);
    }
  });

  it('merges directly overlapping bounding boxes and computes bounding union', () => {
    const items: QuadItem<string>[] = [
      { id: 'a', bounds: { x: 10, y: 10, width: 40, height: 40 } },
      { id: 'b', bounds: { x: 30, y: 30, width: 50, height: 50 } },
    ];

    const clusters = findSpatialClusters(items);
    expect(clusters).toHaveLength(1);
    const cluster = clusters[0];
    expect(cluster?.items).toHaveLength(2);
    // union of [10..50, 10..50] and [30..80, 30..80] => [10..80, 10..80] => x: 10, y: 10, w: 70, h: 70
    expect(cluster?.bounds).toEqual({ x: 10, y: 10, width: 70, height: 70 });
  });

  it('resolves transitive chain connected components through BFS traversal', () => {
    const items: QuadItem<string>[] = [
      { id: 'chain-1', bounds: { x: 0, y: 0, width: 30, height: 20 } },
      { id: 'chain-2', bounds: { x: 25, y: 0, width: 30, height: 20 } }, // overlaps 1
      { id: 'chain-3', bounds: { x: 50, y: 0, width: 30, height: 20 } }, // overlaps 2, not 1
      { id: 'chain-4', bounds: { x: 75, y: 0, width: 30, height: 20 } }, // overlaps 3
    ];

    const clusters = findSpatialClusters(items);
    expect(clusters).toHaveLength(1);
    const cluster = clusters[0];
    expect(cluster?.items).toHaveLength(4);
    expect(cluster?.bounds).toEqual({ x: 0, y: 0, width: 105, height: 20 });
  });

  it('correctly isolates multiple multi-element clusters alongside singletons', () => {
    const items: QuadItem<string>[] = [
      // Cluster A: c1 and c2 overlap
      { id: 'a1', bounds: { x: 0, y: 0, width: 40, height: 40 } },
      { id: 'a2', bounds: { x: 20, y: 20, width: 40, height: 40 } },
      // Cluster B: b1 and b2 overlap far away
      { id: 'b1', bounds: { x: 300, y: 300, width: 30, height: 30 } },
      { id: 'b2', bounds: { x: 320, y: 310, width: 30, height: 30 } },
      // Singleton
      { id: 's1', bounds: { x: 1000, y: 1000, width: 10, height: 10 } },
    ];

    const clusters = findSpatialClusters(items);
    expect(clusters).toHaveLength(3);

    const clusterSizes = clusters.map((c) => c.items.length).sort((a, b) => b - a);
    expect(clusterSizes).toEqual([2, 2, 1]);
  });
});
