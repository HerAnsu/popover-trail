import { describe, it, expect } from 'vitest';
import {
  findEntryIndex,
  findUnifiedEntryIndex,
  filterOutEntryKey,
  elevateKeyInOrder,
} from './index';
import type { TrailEntry } from '../../../types';

describe('stackLookup module', () => {
  const floating: TrailEntry[] = [
    { key: 'float-1', isLoading: false },
    { key: 'float-2', isLoading: false },
  ];
  const trail: TrailEntry[] = [
    { key: 'trail-1', isLoading: false },
    { key: 'trail-2', isLoading: false },
  ];

  it('finds index in single list correctly', () => {
    expect(findEntryIndex(floating, 'float-2')).toBe(1);
    expect(findEntryIndex(floating, 'missing')).toBe(-1);
  });

  it('finds unified index across floating and trail lists', () => {
    expect(findUnifiedEntryIndex(floating, trail, 'float-1')).toBe(0);
    expect(findUnifiedEntryIndex(floating, trail, 'float-2')).toBe(1);
    expect(findUnifiedEntryIndex(floating, trail, 'trail-1')).toBe(2);
    expect(findUnifiedEntryIndex(floating, trail, 'trail-2')).toBe(3);
    expect(findUnifiedEntryIndex(floating, trail, 'non-existent')).toBe(-1);
  });

  it('filters out entry by key without mutating original list', () => {
    const filtered = filterOutEntryKey(trail, 'trail-1');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.key).toBe('trail-2');
  });

  it('elevates key to end of z-index ordering', () => {
    const order = ['a', 'b', 'c'];
    expect(elevateKeyInOrder(order, 'a')).toEqual(['b', 'c', 'a']);
    expect(elevateKeyInOrder(order, 'c')).toEqual(['a', 'b', 'c']);
    expect(elevateKeyInOrder(order, 'd')).toEqual(['a', 'b', 'c', 'd']);
  });
});
