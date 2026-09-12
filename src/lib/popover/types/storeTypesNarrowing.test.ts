import { describe, it, expect } from 'vitest';
import { isStoreIdle, isStoreActive, isStorePinnedOnly } from './storeTypes';
import {
  selectActiveTrail,
  selectFloatingEntries,
  selectIsPinned,
  selectOffset,
  selectZIndexOrder,
  selectTotalActiveCount,
  selectIsIdle,
} from '../store/storeSelectors';
import { createMockStoreState } from '../testing/createMockStoreState';
import { PopoverError, PopoverErrorCode } from '../utils/errors';

describe('Store Types State Discrimination and Narrowing Verification', () => {
  it('verifies type narrowing predicates isStoreIdle, isStoreActive, isStorePinnedOnly', () => {
    const idleState = createMockStoreState({
      trail: [],
      floating: [],
    });

    expect(isStoreIdle(idleState)).toBe(true);
    expect(isStoreActive(idleState)).toBe(false);
    expect(isStorePinnedOnly(idleState)).toBe(false);

    if (isStoreIdle(idleState)) {
      const trailLen: number = idleState.trail.length;
      expect(trailLen).toBe(0);
    }

    const activeState = createMockStoreState({
      trail: [{ key: 'node-1', isLoading: false, error: null }],
      floating: [],
    });

    expect(isStoreIdle(activeState)).toBe(false);
    expect(isStoreActive(activeState)).toBe(true);
    expect(isStorePinnedOnly(activeState)).toBe(false);

    const pinnedState = createMockStoreState({
      trail: [],
      floating: [{ key: 'pinned-1', isLoading: false, error: null }],
    });

    expect(isStoreIdle(pinnedState)).toBe(false);
    expect(isStoreActive(pinnedState)).toBe(false);
    expect(isStorePinnedOnly(pinnedState)).toBe(true);
  });

  it('verifies polymorphic pure selectors operate on minimal substate shapes', () => {
    expect(selectActiveTrail({ trail: [] })).toEqual([]);
    expect(selectFloatingEntries({ floating: [] })).toEqual([]);
    expect(selectIsPinned('card-1')({ pinnedStates: { 'card-1': true } })).toBe(true);
    expect(selectIsPinned('card-2')({ pinnedStates: { 'card-2': false } })).toBe(false);

    expect(selectOffset('card-1')({ offsets: { 'card-1': { x: 10, y: 20 } } })).toEqual({
      x: 10,
      y: 20,
    });
    expect(selectOffset('card-2')({ offsets: {} })).toEqual({ x: 0, y: 0 });

    expect(selectZIndexOrder({ zIndexOrder: ['card-1', 'card-2'] })).toEqual(['card-1', 'card-2']);
    expect(selectTotalActiveCount({ floating: [1], trail: [2, 3] })).toBe(3);
    expect(selectIsIdle({ floating: [], trail: [] })).toBe(true);
  });

  it('verifies generic PopoverError code discrimination and static type predicate', () => {
    const error = new PopoverError(
      PopoverErrorCode.CIRCULAR_CASCADE,
      'Cycle detected',
      'Break relationship',
    );

    expect(PopoverError.isPopoverError(error)).toBe(true);
    expect(PopoverError.isPopoverError(error, PopoverErrorCode.CIRCULAR_CASCADE)).toBe(true);
    expect(PopoverError.isPopoverError(error, PopoverErrorCode.INVALID_TRANSITION)).toBe(false);

    if (PopoverError.isPopoverError(error, PopoverErrorCode.CIRCULAR_CASCADE)) {
      const code: 'ERR_CIRCULAR_CASCADE' = error.code;
      expect(code).toBe(PopoverErrorCode.CIRCULAR_CASCADE);
    }
  });
});
