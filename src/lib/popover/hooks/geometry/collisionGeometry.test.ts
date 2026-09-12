import { describe, it, expect } from 'vitest';
import type { TrailEntry, DragOffset } from '../../types';
import { applySpatialCollisionNudge } from './collisionGeometry';

describe('collisionGeometry', () => {
  it('returns original position when activeFloating is empty', () => {
    const result = applySpatialCollisionNudge('card-1', 100, 150, 1920, 1080, [], {});
    expect(result).toEqual({ top: 100, left: 150 });
  });

  it('ignores self and non-overlapping siblings', () => {
    const selfSibling: TrailEntry = {
      key: 'card-1',
      isLoading: false,
      error: null,
      pinnedLayoutPos: { top: 100, left: 150 },
    };
    const distantSibling: TrailEntry = {
      key: 'card-2',
      isLoading: false,
      error: null,
      pinnedLayoutPos: { top: 700, left: 800 },
    };

    const result = applySpatialCollisionNudge(
      'card-1',
      100,
      150,
      1920,
      1080,
      [selfSibling, distantSibling],
      {},
    );
    expect(result).toEqual({ top: 100, left: 150 });
  });

  it('adjusts position with lowest energy placement when a collision is detected', () => {
    const sibling: TrailEntry = {
      key: 'card-overlap',
      isLoading: false,
      error: null,
      pinnedLayoutPos: { top: 100, left: 150 },
    };

    const result = applySpatialCollisionNudge(
      'card-current',
      100,
      150,
      1920,
      1080,
      [sibling],
      {},
    );

    expect(result).not.toEqual({ top: 100, left: 150 });
    expect(typeof result.top).toBe('number');
    expect(typeof result.left).toBe('number');
  });

  it('incorporates activeOffsets when computing sibling bounding boxes', () => {
    const sibling: TrailEntry = {
      key: 'card-moved',
      isLoading: false,
      error: null,
      pinnedLayoutPos: { top: 0, left: 0 },
    };
    const offsets: Record<string, DragOffset> = {
      'card-moved': { x: 100, y: 100 },
    };

    const result = applySpatialCollisionNudge(
      'card-target',
      100,
      100,
      1920,
      1080,
      [sibling],
      offsets,
    );

    expect(result).not.toEqual({ top: 100, left: 100 });
  });
});
