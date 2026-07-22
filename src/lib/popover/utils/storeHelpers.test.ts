import { describe, it, expect } from 'vitest';
import {
  getEntryAtIndex,
  findEntryIndex,
  hasEntryWithKey,
  updateEntryInLists,
} from './storeHelpers';
import type { TrailEntry } from '../types';

describe('storeHelpers utility functions', () => {
  const floating: TrailEntry[] = [
    { key: 'pinned-1', isLoading: false, error: null },
    { key: 'pinned-2', isLoading: false, error: null },
  ];

  const trail: TrailEntry[] = [
    { key: 'trail-1', isLoading: false, error: null },
    { key: 'trail-2', isLoading: false, error: null },
  ];

  it('retrieves entries at virtual indexes combining floating and trail arrays', () => {
    expect(getEntryAtIndex(floating, trail, 0)?.key).toBe('pinned-1');
    expect(getEntryAtIndex(floating, trail, 1)?.key).toBe('pinned-2');
    expect(getEntryAtIndex(floating, trail, 2)?.key).toBe('trail-1');
    expect(getEntryAtIndex(floating, trail, 3)?.key).toBe('trail-2');
    expect(getEntryAtIndex(floating, trail, 99)).toBeUndefined();
  });

  it('finds virtual index by entry key', () => {
    expect(findEntryIndex(floating, trail, 'pinned-1')).toBe(0);
    expect(findEntryIndex(floating, trail, 'pinned-2')).toBe(1);
    expect(findEntryIndex(floating, trail, 'trail-1')).toBe(2);
    expect(findEntryIndex(floating, trail, 'trail-2')).toBe(3);
    expect(findEntryIndex(floating, trail, 'unknown')).toBe(-1);
  });

  it('checks if an entry exists in floating or trail lists with hasEntryWithKey', () => {
    expect(hasEntryWithKey(floating, trail, 'pinned-1')).toBe(true);
    expect(hasEntryWithKey(floating, trail, 'trail-1')).toBe(true);
    expect(hasEntryWithKey(floating, trail, 'non-existent')).toBe(false);
  });

  it('updates target entry in floating or trail lists while preserving reference for un-modified array', () => {
    const updated = updateEntryInLists(floating, trail, 'trail-1', {
      isLoading: true,
    });

    expect(updated.floating).toBe(floating); // Reference preserved!
    expect(updated.trail).not.toBe(trail);
    expect(updated.trail[0]?.isLoading).toBe(true);
  });
});
