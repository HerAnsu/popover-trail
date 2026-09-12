import { describe, it, expect, vi } from 'vitest';
import {
  composeResetters,
  createPropertyResetter,
  createCollectionResetter,
  createArrayResetter,
  createVector2DResetter,
  createBoundingBoxResetter,
  createNoopResetter,
} from './poolReset';

describe('poolReset', () => {
  it('chains multiple resetters with composeResetters', () => {
    const step1 = vi.fn((obj: { a: number; b: number }) => { obj.a = 0; });
    const step2 = vi.fn((obj: { a: number; b: number }) => { obj.b = 0; });
    const combined = composeResetters(step1, step2);

    const target = { a: 10, b: 20 };
    combined(target);
    expect(target).toEqual({ a: 0, b: 0 });
    expect(step1).toHaveBeenCalled();
    expect(step2).toHaveBeenCalled();
  });

  it('resets object properties with createPropertyResetter', () => {
    const reset = createPropertyResetter<{ x: number; y: number; name?: string }>({
      x: 0,
      y: 0,
      name: undefined,
    });

    const item = { x: 50, y: 100, name: 'active' };
    reset(item);
    expect(item).toEqual({ x: 0, y: 0, name: undefined });
  });

  it('resets collection clearable objects with createCollectionResetter', () => {
    const set = new Set([1, 2, 3]);
    const resetSet = createCollectionResetter<Set<number>>();
    resetSet(set);
    expect(set.size).toBe(0);

    const map = new Map([['a', 1]]);
    const resetMap = createCollectionResetter<Map<string, number>>();
    resetMap(map);
    expect(map.size).toBe(0);
  });

  it('resets arrays with createArrayResetter', () => {
    const arr = [1, 2, 3, 4];
    const resetArr = createArrayResetter<number[]>();
    resetArr(arr);
    expect(arr).toHaveLength(0);
  });

  it('resets vector 2D coordinates with createVector2DResetter', () => {
    const resetVec = createVector2DResetter(10, 20);
    const vec = { x: 999, y: -456 };
    resetVec(vec);
    expect(vec).toEqual({ x: 10, y: 20 });

    const defaultReset = createVector2DResetter();
    defaultReset(vec);
    expect(vec).toEqual({ x: 0, y: 0 });
  });

  it('resets bounding boxes with createBoundingBoxResetter', () => {
    const resetBox = createBoundingBoxResetter(1, 2, 100, 200);
    const box = { x: 50, y: 60, width: 800, height: 600 };
    resetBox(box);
    expect(box).toEqual({ x: 1, y: 2, width: 100, height: 200 });

    const defaultBoxReset = createBoundingBoxResetter();
    defaultBoxReset(box);
    expect(box).toEqual({ x: 0, y: 0, width: 0, height: 0 });
  });

  it('noop resetter preserves item without mutation', () => {
    const noop = createNoopResetter<{ id: number }>();
    const item = { id: 42 };
    noop(item);
    expect(item.id).toBe(42);
  });
});

