import { describe, it, expect } from 'vitest';
import {
  Ok,
  Err,
  isOk,
  isErr,
  clamp,
  lerp,
  normalizeRatio,
  QuadTree,
  boxesIntersect,
  compactRecord,
  omitRecordKeys,
  safeAssign,
  partition,
  unique,
  compact,
  groupBy,
  pipe,
  compose,
  curry2,
  prop,
  truncate,
  capitalize,
  ensurePrefix,
  PopoverError,
  PopoverErrorCode,
  Point2D,
  RectBounds,
  createDisposable,
  CompositeDisposable,
} from './utils';

describe('popover-trail/utils subpath entrypoint', () => {
  it('exports Result algebraic types and monads', () => {
    const okVal = Ok(42);
    expect(isOk(okVal)).toBe(true);
    expect(isErr(okVal)).toBe(false);

    const errVal = Err(new Error('fail'));
    expect(isErr(errVal)).toBe(true);
  });

  it('exports canonical mathematical and interpolation functions', () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(lerp(0, 100, 0.5)).toBe(50);
    expect(normalizeRatio(50, 0, 100)).toBe(0.5);
  });

  it('exports spatial QuadTree and bounding box algorithms', () => {
    const qt = new QuadTree({ x: 0, y: 0, width: 100, height: 100 });
    expect(qt.size).toBe(0);
    expect(boxesIntersect({ x: 0, y: 0, width: 10, height: 10 }, { x: 5, y: 5, width: 10, height: 10 })).toBe(true);
  });

  it('exports object and record manipulation utilities', () => {
    expect(compactRecord({ a: 1, b: undefined, c: null })).toEqual({ a: 1 });
    const rec: Record<string, number> = { a: 1, b: 2, c: 3 };
    expect(omitRecordKeys(rec, ['b'])).toEqual({ a: 1, c: 3 });
    expect(safeAssign({}, { a: 1 })).toEqual({ a: 1 });
  });

  it('exports collection algebra utilities', () => {
    expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3]);
    expect(compact([1, null, 2, undefined, 3])).toEqual([1, 2, 3]);
    const [evens, odds] = partition([1, 2, 3, 4], (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4]);
    expect(odds).toEqual([1, 3]);
    expect(groupBy(['a', 'bb', 'c'], (s) => s.length)).toEqual({ 1: ['a', 'c'], 2: ['bb'] });
  });

  it('exports functional combinators', () => {
    const add1 = (n: number) => n + 1;
    const double = (n: number) => n * 2;
    expect(pipe(5, add1, double)).toBe(12);
    expect(compose(double, add1)(5)).toBe(12);
    const curriedAdd = curry2((a: number, b: number) => a + b);
    expect(curriedAdd(3)(4)).toBe(7);
    const getX = prop<{ x: number }, 'x'>('x');
    expect(getX({ x: 99 })).toBe(99);
  });

  it('exports string utilities and error models', () => {
    expect(truncate('Hello World', 8)).toBe('Hello...');
    expect(capitalize('action')).toBe('Action');
    expect(ensurePrefix('test', '--pt-')).toBe('--pt-test');

    const err = new PopoverError(PopoverErrorCode.CIRCULAR_CASCADE, 'cycle');
    expect(err.code).toBe(PopoverErrorCode.CIRCULAR_CASCADE);
  });

  it('exports value objects and resource disposables', () => {
    const pt = new Point2D(10, 20);
    expect(pt.x).toBe(10);
    expect(pt.y).toBe(20);

    const rect = new RectBounds(0, 0, 100, 100);
    expect(rect.width).toBe(100);

    let disposed = false;
    const d = createDisposable(() => { disposed = true; });
    d[Symbol.dispose]?.();
    expect(disposed).toBe(true);

    const composite = new CompositeDisposable();
    expect(composite.isDisposed).toBe(false);
  });
});
