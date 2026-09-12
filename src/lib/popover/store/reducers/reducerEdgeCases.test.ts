import { describe, it, expect } from 'vitest';
import {
  closeFromState,
  closeByTargetKeyState,
  updateOffsetState,
  togglePinState,
  pushNestedState,
  bringToFrontPatch,
  filterRecord,
} from './index';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('reducerEdgeCases module', () => {
  it('returns empty object when updating offsets with NaN or Infinity coordinates', () => {
    const state = createMockStoreState({ offsets: { k1: { x: 10, y: 10 } } });
    expect(updateOffsetState(state, 'k1', { x: Number.NaN, y: 20 })).toEqual({});
    expect(updateOffsetState(state, 'k1', { x: 20, y: Number.POSITIVE_INFINITY })).toEqual({});
    expect(updateOffsetState(state, 'k1', { x: Number.NEGATIVE_INFINITY, y: 10 })).toEqual({});
  });

  it('returns empty object when offset is identical to current offset', () => {
    const state = createMockStoreState({ offsets: { k1: { x: 15, y: 25 } } });
    expect(updateOffsetState(state, 'k1', { x: 15, y: 25 })).toEqual({});
  });

  it('handles togglePin and close for absent keys returning empty object', () => {
    const state = createMockStoreState({ floating: [], trail: [] });
    expect(togglePinState(state, 'non-existent')).toEqual({});
    expect(closeFromState(state, 999)).toEqual({});
    expect(closeByTargetKeyState(state, 'non-existent')).toEqual({});
  });

  it('handles pushNestedState with out-of-bounds negative index gracefully', () => {
    const state = createMockStoreState({ trail: [{ key: 'root-1', isLoading: false }] });
    expect(pushNestedState(state, -1, { key: 'child-1', isLoading: false })).toEqual({});
  });

  it('handles bringToFrontPatch for inactive key returning empty object', () => {
    const state = createMockStoreState({ trail: [{ key: 'root-1', isLoading: false }] });
    expect(bringToFrontPatch(state, 'inactive-key')).toEqual({});
  });

  it('sanitizes prototype pollution keys in filterRecord', () => {
    const record = { normal: 1, __proto__: 2 } as Record<string, number>;
    const allowed = new Set(['normal', '__proto__']);
    const filtered = filterRecord(record, allowed);
    expect(filtered.normal).toBe(1);
    expect(Object.hasOwn(filtered, '__proto__')).toBe(false);
  });
});
