import { describe, it, expect } from 'vitest';
import {
  type UnionToIntersection,
  type ResolveDataForKey,
  type StateSelector,
  type PopoverStateData,
} from './storeTypes';
import { createMockStoreState } from '../testing/createMockStoreState';
import { PopoverDAG } from '../utils/dag';
import { QuadTree } from '../utils/quadTree';
import { createControllerManager } from '../store/storeControllers';
import { PopoverTransitionScheduler } from '../store/transitionScheduler';

describe('Store Types and Subtyping Calculus Verification', () => {
  it('verifies UnionToIntersection computes correct intersection type at compile time', () => {
    type ActionUnion = { track: (e: string) => void } | { reset: () => void };
    type ActionIntersection = UnionToIntersection<ActionUnion>;

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
});
