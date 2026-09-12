import { describe, it, expect, vi } from 'vitest';
import type { StoreApi } from 'zustand';
import type { TrailEntry, PopoverStore } from '../../types';
import {
  calculateBaseOffsetPosition,
  computeCascadePosition,
  resolveUnpinnedLayoutPosition,
} from './cascadePosition';
import { applySpatialCollisionNudge } from './collisionGeometry';

vi.mock('./collisionGeometry', () => ({
  applySpatialCollisionNudge: vi.fn((_id, top, left) => ({ top: top + 10, left: left + 10 })),
}));

describe('cascadePosition', () => {
  const createMockStoreApi = (overrides?: Partial<PopoverStore>): StoreApi<PopoverStore> =>
    ({
      getState: () =>
        ({
          floating: [],
          offsets: {},
          ...overrides,
        }) as unknown as PopoverStore,
    }) as unknown as StoreApi<PopoverStore>;

  describe('calculateBaseOffsetPosition', () => {
    it('calculates offsets for left, right, top, and bottom directions', () => {
      expect(calculateBaseOffsetPosition(2, 20, 'left', 100, 200)).toEqual({ baseTop: 100, baseLeft: 160 });
      expect(calculateBaseOffsetPosition(2, 20, 'right', 100, 200)).toEqual({ baseTop: 100, baseLeft: 240 });
      expect(calculateBaseOffsetPosition(3, 15, 'top', 100, 200)).toEqual({ baseTop: 55, baseLeft: 200 });
      expect(calculateBaseOffsetPosition(3, 15, 'bottom', 100, 200)).toEqual({ baseTop: 145, baseLeft: 200 });
    });
  });

  describe('computeCascadePosition', () => {
    it('returns direct base coordinates when spatial collision is disabled and defaults to right', () => {
      const storeApi = createMockStoreApi();
      const pos = computeCascadePosition({
        zIndex: 2,
        step: 24,
        y: 50,
        x: 60,
        storeApi,
        id: 'c1',
        winWidth: 1024,
        winHeight: 768,
      });

      expect(pos).toEqual({ top: 50, left: 108 });
      expect(applySpatialCollisionNudge).not.toHaveBeenCalled();
    });

    it('delegates to applySpatialCollisionNudge when spatial collision is enabled', () => {
      const storeApi = createMockStoreApi();
      const pos = computeCascadePosition({
        zIndex: 1,
        step: 20,
        direction: 'bottom',
        y: 40,
        x: 80,
        enableSpatialCollision: true,
        storeApi,
        id: 'c2',
        winWidth: 800,
        winHeight: 600,
      });

      expect(applySpatialCollisionNudge).toHaveBeenCalledWith(
        'c2',
        60,
        80,
        800,
        600,
        [],
        {},
      );
      expect(pos).toEqual({ top: 70, left: 90 });
    });
  });

  describe('resolveUnpinnedLayoutPosition', () => {
    it('returns pinnedLayoutPos immediately when present on the entry', () => {
      const storeApi = createMockStoreApi();
      const entry: TrailEntry = {
        key: 'p1',
        isLoading: false,
        error: null,
        pinnedLayoutPos: { top: 310, left: 420 },
      };

      const result = resolveUnpinnedLayoutPosition(
        'p1',
        entry,
        20,
        'bottom',
        1,
        100,
        100,
        false,
        storeApi,
        1024,
        768,
      );

      expect(result).toEqual({ top: 310, left: 420 });
    });

    it('derives direction from placement prefixes and handles null x, y coordinates', () => {
      const storeApi = createMockStoreApi();

      const posLeft = resolveUnpinnedLayoutPosition(
        'c-left',
        undefined,
        10,
        'left-start',
        2,
        null,
        null,
        false,
        storeApi,
        1024,
        768,
      );
      expect(posLeft).toEqual({ top: 0, left: -20 });

      const posTop = resolveUnpinnedLayoutPosition(
        'c-top',
        undefined,
        10,
        'top-end',
        1,
        50,
        50,
        false,
        storeApi,
        1024,
        768,
      );
      expect(posTop).toEqual({ top: 40, left: 50 });
    });
  });
});
