import { describe, it, expect } from 'vitest';
import {
  getEntryAtIndex,
  findEntryIndex,
  hasEntryWithKey,
  findEntryInStore,
  unique,
  partition,
  groupBy,
  keyBy,
  chunk,
  zip,
  range,
} from './collections';

import type { TrailEntry } from '../types';

describe('collections utilities', () => {
  const mockEntry = (key: string): TrailEntry => ({
    key,
    status: 'idle',
    data: null,
    error: null,
    isLoading: false,
    rect: undefined,
  });

  it('searches entries across floating and trail lists', () => {
    const floating = [mockEntry('f1')];
    const trail = [mockEntry('t1'), mockEntry('t2')];

    expect(getEntryAtIndex(floating, trail, 0)?.key).toBe('f1');
    expect(getEntryAtIndex(floating, trail, 1)?.key).toBe('t1');
    expect(getEntryAtIndex(floating, trail, 2)?.key).toBe('t2');
    expect(getEntryAtIndex(floating, trail, 3)).toBeUndefined();

    expect(findEntryIndex(floating, trail, 't1')).toBe(1);
    expect(findEntryIndex(floating, trail, 'none')).toBe(-1);

    expect(hasEntryWithKey(floating, trail, 'f1')).toBe(true);
    expect(hasEntryWithKey(floating, trail, 'unknown')).toBe(false);

    expect(findEntryInStore(floating, trail, 't2')?.key).toBe('t2');
    expect(findEntryInStore(floating, trail, 'none')).toBeUndefined();
  });

  it('unique deduplicates arrays preserving order', () => {
    expect(unique([1, 2, 2, 3, 1, 4])).toEqual([1, 2, 3, 4]);
    expect(unique(['a', 'b', 'a'])).toEqual(['a', 'b']);
    expect(unique([])).toEqual([]);
    expect(unique([42])).toEqual([42]);
  });

  it('partition divides elements into truthy and falsy tuples', () => {
    const [evens, odds] = partition([1, 2, 3, 4, 5, 6], (n) => n % 2 === 0);
    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  it('groupBy aggregates elements by extracted key', () => {
    const items = [
      { id: 1, group: 'A' },
      { id: 2, group: 'B' },
      { id: 3, group: 'A' },
    ];
    const grouped = groupBy(items, (x) => x.group);
    expect(grouped.A).toHaveLength(2);
    expect(grouped.B).toHaveLength(1);
  });

  it('keyBy indexes elements into dictionary', () => {
    const users = [
      { id: 'u1', name: 'Alice' },
      { id: 'u2', name: 'Bob' },
    ];
    const indexed = keyBy(users, (u) => u.id);
    expect(indexed.u1?.name).toBe('Alice');
    expect(indexed.u2?.name).toBe('Bob');
  });

  it('chunk divides array into batches', () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]]);
    expect(chunk([], 3)).toEqual([]);
    expect(chunk([1, 2], 5)).toEqual([[1, 2]]);
  });

  it('zip pairs elements into tuples up to shortest length', () => {
    expect(zip(['a', 'b', 'c'], [1, 2])).toEqual([
      ['a', 1],
      ['b', 2],
    ]);
    expect(zip([], [1, 2])).toEqual([]);
    expect(zip([1, 2], [])).toEqual([]);
  });

  it('range generates arithmetic progressions', () => {
    expect(range(0, 5)).toEqual([0, 1, 2, 3, 4]);
    expect(range(2, 8, 2)).toEqual([2, 4, 6]);
    expect(range(5, 0, -1)).toEqual([5, 4, 3, 2, 1]);
    expect(range(5, 5)).toEqual([]);
    expect(range(10, 5, 1)).toEqual([]);
  });
});

