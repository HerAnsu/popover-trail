import { describe, it, expect } from 'vitest';
import {
  isStoreIdle,
  isStoreActive,
  isStorePinnedOnly,
  type PopoverStateData,
  type UnionToIntersection,
  type ResolveDataForKey,
  type StateSelector,
} from './storeTypes';
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
import { PopoverDAG } from '../utils/dag';
import { QuadTree } from '../utils/quadTree';
import { createControllerManager } from '../store/storeControllers';
import { PopoverTransitionScheduler } from '../store/transitionScheduler';
import { PopoverError, PopoverErrorCode } from '../utils/errors';

describe('Store Types and Subtyping Calculus Verification', () => {
  it('verifies UnionToIntersection computes correct intersection type at compile time', () => {
    type ActionUnion = { track: (e: string) => void } | { reset: () => void };
    type ActionIntersection = UnionToIntersection<ActionUnion>;

    // Type-level assertion
    const actions: ActionIntersection = {
      track: () => {},
      reset: () => {},
    };

    expect(typeof actions.track).toBe('function');
    expect(typeof actions.reset).toBe('function');
  });

  it('verifies heterogeneous ResolveDataForKey fallback and resolution', () => {
    interface TestDataMap {
      user: { id: string; name: string };
      settings: { theme: 'dark' | 'light' };
    }

    type UserData = ResolveDataForKey<TestDataMap, 'user', null>;
    type SettingsData = ResolveDataForKey<TestDataMap, 'settings', null>;
    type UnknownData = ResolveDataForKey<TestDataMap, 'unknownKey', { fallback: boolean }>;

    const user: UserData = { id: '1', name: 'Alice' };
    const settings: SettingsData = { theme: 'dark' };
    const fallback: UnknownData = { fallback: true };

    expect(user.name).toBe('Alice');
    expect(settings.theme).toBe('dark');
    expect(fallback.fallback).toBe(true);
  });

  it('verifies type narrowing predicates isStoreIdle, isStoreActive, isStorePinnedOnly', () => {
    const idleState = createMockStoreState({
      trail: [],
      floating: [],
    });

    expect(isStoreIdle(idleState)).toBe(true);
    expect(isStoreActive(idleState)).toBe(false);
    expect(isStorePinnedOnly(idleState)).toBe(false);

    if (isStoreIdle(idleState)) {
      // Type is narrowed to IdleStoreState
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
    // HasTrailState
    expect(selectActiveTrail({ trail: [] })).toEqual([]);

    // HasFloatingState
    expect(selectFloatingEntries({ floating: [] })).toEqual([]);

    // HasPinnedStates
    expect(selectIsPinned('card-1')({ pinnedStates: { 'card-1': true } })).toBe(true);
    expect(selectIsPinned('card-2')({ pinnedStates: { 'card-2': false } })).toBe(false);

    // HasOffsetsState
    expect(selectOffset('card-1')({ offsets: { 'card-1': { x: 10, y: 20 } } })).toEqual({
      x: 10,
      y: 20,
    });
    expect(selectOffset('card-2')({ offsets: {} })).toEqual({ x: 0, y: 0 });

    // HasZIndexState
    expect(selectZIndexOrder({ zIndexOrder: ['card-1', 'card-2'] })).toEqual(['card-1', 'card-2']);

    // Counts
    expect(selectTotalActiveCount({ floating: [1], trail: [2, 3] })).toBe(3);
    expect(selectIsIdle({ floating: [], trail: [] })).toBe(true);
  });

  it('verifies StateSelector type alias correctly types selector functions', () => {
    type TestState = PopoverStateData<number, string>;
    const getTrailCount: StateSelector<TestState, number> = (s) => s.trail.length;

    const mock = createMockStoreState<number, string>();
    expect(getTrailCount(mock)).toBe(0);
  });

  it('verifies generic PopoverDAG and QuadTree with domain key types', () => {
    type AppPopoverKeys = 'user' | 'profile' | 'feed';

    const dag = new PopoverDAG<AppPopoverKeys>();
    dag.addNode('user');
    dag.addNode('profile', 'user');

    expect(dag.hasNode('user')).toBe(true);
    expect(dag.getDescendantKeys('user').has('profile')).toBe(true);

    const quad = new QuadTree<AppPopoverKeys>({ x: 0, y: 0, width: 800, height: 600 });
    quad.insert({ id: 'user', bounds: { x: 10, y: 10, width: 100, height: 100 } });
    expect(quad.size).toBe(1);
    expect(quad.remove('user')).toBe(true);
  });

  it('verifies generic ControllerManager and TransitionScheduler with domain key types', () => {
    type DomainKeys = 'modalA' | 'modalB';

    const controllers = createControllerManager<string, DomainKeys>();
    const ctrl = controllers.registerController('modalA');
    expect(ctrl).toBeInstanceOf(AbortController);
    controllers.dispose();

    const scheduler = new PopoverTransitionScheduler();
    expect(scheduler).toBeInstanceOf(PopoverTransitionScheduler);
    scheduler.scheduleHoverLeave('modalA', 0, () => {});
    scheduler.dispose();
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
      // Type is narrowed to PopoverError<'ERR_CIRCULAR_CASCADE'>
      const code: 'ERR_CIRCULAR_CASCADE' = error.code;
      expect(code).toBe(PopoverErrorCode.CIRCULAR_CASCADE);
    }
  });
});
