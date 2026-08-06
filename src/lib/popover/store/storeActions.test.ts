import { describe, it, expect } from 'vitest';
import {
  isPinnedEntry,
  isKeyInZIndexOrder,
  reduceTogglePinState,
  reduceUpdateOffsetState,
} from './storeActions';
import { PopoverStore, TrailEntry } from '../types';

describe('storeActions module', () => {
  it('checks if popover key is pinned in pinnedStates', () => {
    expect(isPinnedEntry({ 'card-1': true }, 'card-1')).toBe(true);
    expect(isPinnedEntry({ 'card-1': false }, 'card-1')).toBe(false);
    expect(isPinnedEntry({}, 'unknown')).toBe(false);
  });

  it('checks if key exists in zIndexOrder list', () => {
    expect(isKeyInZIndexOrder(['card-1', 'card-2'], 'card-2')).toBe(true);
    expect(isKeyInZIndexOrder(['card-1'], 'card-2')).toBe(false);
  });

  it('reduces offset updates for a popover key', () => {
    const mockStore = {
      offsets: { 'card-1': { x: 0, y: 0 } },
    } as unknown as PopoverStore;

    const patch = reduceUpdateOffsetState(mockStore, 'card-1', { x: 100, y: 200 });
    expect(patch.offsets?.['card-1']).toEqual({ x: 100, y: 200 });
  });

  it('reduces toggle pin state patch for a trail entry', () => {
    const mockStore = {
      floating: [],
      trail: [{ key: 'card-1' } as TrailEntry<unknown>],
      pinnedStates: {},
      offsets: {},
      zIndexOrder: ['card-1'],
    } as unknown as PopoverStore;

    const patch = reduceTogglePinState(mockStore, 'card-1');
    expect(patch.pinnedStates?.['card-1']).toBe(true);
  });

  it('unpins floating card when toggled back', () => {
    const mockStore = {
      floating: [{ key: 'card-1' } as TrailEntry<unknown>],
      trail: [],
      pinnedStates: { 'card-1': true },
      offsets: { 'card-1': { x: 10, y: 10 } },
      zIndexOrder: ['card-1'],
    } as unknown as PopoverStore;

    const patch = reduceTogglePinState(mockStore, 'card-1');
    expect(patch.pinnedStates?.['card-1']).toBe(false);
  });

  it('preserves existing unrelated card offsets when reduceUpdateOffsetState is called', () => {
    const mockStore = {
      offsets: { 'card-1': { x: 10, y: 20 } },
    } as unknown as PopoverStore;

    const patch = reduceUpdateOffsetState(mockStore, 'card-2', { x: 50, y: 60 });
    expect(patch.offsets?.['card-1']).toEqual({ x: 10, y: 20 });
    expect(patch.offsets?.['card-2']).toEqual({ x: 50, y: 60 });
  });
});
