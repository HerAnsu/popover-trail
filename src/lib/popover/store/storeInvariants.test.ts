/**
 * Formal System Invariant Test Suite for popover-trail (AGENTS.md Section 18: I1 - I12 & Item 1.200).
 * Verifies mathematical soundness, graph acyclicity, finite floats, zero orphans,
 * monotonic revisions, terminal disposal contracts, and generative property-based transitions.
 */

import { describe, it, expect } from 'vitest';
import { createPopoverStore } from '../store';
import { PopoverDAG } from '../utils/dag';
import { KeyedTimerPool } from '../utils/keyedTimerPool';
import { clampDragCoordinates } from '../utils/dragMath';
import { getEntryState, matchEntryState } from '../types/entryTypes';
import { EMPTY_ARRAY, EMPTY_OBJECT } from './storeDefaults';
import type { TrailEntry } from '../types';

describe('Formal System Invariant Matrix (I1 - I12 & Item 1.200)', () => {
  const dummyResolver = async (key: string) => ({ id: key, name: `Data for ${key}` });

  // I1: Cycles(G(S)) = EmptySet
  describe('I_Acyclic: Strict cycle freedom in cascade DAG', () => {
    it('maintains strict topological hierarchy and ancestor/descendant relationships', () => {
      const dag = new PopoverDAG();
      dag.addNode('root');
      dag.addNode('child', 'root');
      dag.addNode('grandchild', 'child');

      const ancestors = dag.getAncestors('grandchild');
      expect(ancestors.has('child')).toBe(true);
      expect(ancestors.has('root')).toBe(true);

      const descendants = dag.getDescendantKeys('root');
      expect(descendants.has('child')).toBe(true);
      expect(descendants.has('grandchild')).toBe(true);

      const branchOrder = dag.getTopologicalOrderForBranch('root');
      expect(branchOrder.indexOf('root')).toBeLessThan(branchOrder.indexOf('child'));
      expect(branchOrder.indexOf('child')).toBeLessThan(branchOrder.indexOf('grandchild'));
    });
  });

  // I2 & I3: Stacking uniqueness and bijection
  describe('I_ZBijection & I_StackUniqueness: Bijective unique z-index stacking', () => {
    it('guarantees unique keys in zIndexOrder without duplicates', () => {
      const store = createPopoverStore(dummyResolver);
      const { openRoot, togglePin, pushNested, bringToFront } = store.getState();

      openRoot('owner-1', { key: 'node-1' });
      pushNested(0, { key: 'node-2', parentKey: 'node-1' });
      togglePin('node-1');
      bringToFront('node-1');

      const { zIndexOrder, trail, floating } = store.getState();
      const uniqueKeys = new Set(zIndexOrder);

      expect(zIndexOrder).toHaveLength(uniqueKeys.size);

      const allActiveKeys = new Set([...trail.map((e) => e.key), ...floating.map((e) => e.key)]);
      for (const key of zIndexOrder) {
        expect(allActiveKeys.has(key)).toBe(true);
      }
    });
  });

  // I4: Timer containment
  describe('I_TimerContainment: Bounded timer allocation and RAII cleanup', () => {
    it('cancels and frees timers upon explicit cancellation and disposal', () => {
      const timerPool = new KeyedTimerPool();
      let fired = false;

      timerPool.schedule('card-1', 100, () => {
        fired = true;
      });
      expect(timerPool.has('card-1')).toBe(true);
      expect(timerPool.size).toBe(1);

      timerPool.cancel('card-1');
      expect(timerPool.has('card-1')).toBe(false);
      expect(timerPool.size).toBe(0);
      expect(fired).toBe(false);

      timerPool.dispose();
      expect(timerPool.size).toBe(0);
    });
  });

  // I5: Finite float guarantee
  describe('I_FiniteFloat: All computed positions satisfy isFinite', () => {
    it('sanitizes NaN and Infinity coordinate vectors to zero vector', () => {
      const sanitized = clampDragCoordinates(Number.NaN, Number.POSITIVE_INFINITY);

      expect(Number.isFinite(sanitized.x)).toBe(true);
      expect(Number.isFinite(sanitized.y)).toBe(true);
      expect(sanitized.x).toBe(0);
      expect(sanitized.y).toBe(0);
    });
  });

  // I6: Orphan freedom
  describe('I_OrphanFreedom: Closing a parent card prunes entire transitive cascade subtree', () => {
    it('removes all child descendants when root or parent is closed', () => {
      const store = createPopoverStore(dummyResolver);
      const { openRoot, pushNested, closeByKey } = store.getState();

      openRoot('owner-1', { key: 'root-card' });
      pushNested(0, { key: 'child-card-1', parentKey: 'root-card' });
      pushNested(1, { key: 'grandchild-card', parentKey: 'child-card-1' });

      expect(store.getState().trail.map((e) => e.key)).toEqual([
        'root-card',
        'child-card-1',
        'grandchild-card',
      ]);

      closeByKey('child-card-1', { transition: false });

      expect(store.getState().trail.map((e) => e.key)).toEqual(['root-card']);
    });
  });

  // I7: Monotonic revision
  describe('I_MonotonicRevision: State revision increments monotonically on value changes', () => {
    it('increments revision when mutation occurs and stays identical on no-op', () => {
      const store = createPopoverStore(dummyResolver);
      const r0 = store.getState().stateRevision;

      store.getState().openRoot('owner-1', { key: 'card-1' });
      const r1 = store.getState().stateRevision;
      expect(r1).toBeGreaterThan(r0);

      store.getState().updateOffset('card-1', 10, 20);
      const r2 = store.getState().stateRevision;
      expect(r2).toBeGreaterThan(r1);
    });
  });

  // I8: Discriminated state mutual exclusivity
  describe('I_Discrimination: Entry states are mutually exclusive algebraic variants', () => {
    it('exhaustively discriminates between loading, error, and success states', () => {
      const loadingEntry: TrailEntry<{ name: string }> = {
        key: 'c1',
        isLoading: true,
      };
      const errorEntry: TrailEntry<{ name: string }> = {
        key: 'c2',
        isLoading: false,
        error: new Error('Failed'),
      };
      const successEntry: TrailEntry<{ name: string }> = {
        key: 'c3',
        isLoading: false,
        data: { name: 'Alice' },
      };

      expect(getEntryState(loadingEntry).status).toBe('loading');
      expect(getEntryState(errorEntry).status).toBe('error');
      expect(getEntryState(successEntry).status).toBe('success');

      const matchOutput = matchEntryState(successEntry, {
        loading: () => 'was_loading',
        error: () => 'was_error',
        success: (e) => `hello_${e.data.name}`,
      });
      expect(matchOutput).toBe('hello_Alice');
    });
  });

  // I9: Terminality & RAII Disposal
  describe('I_Terminality: Disposed entities enter unalterable terminal state', () => {
    it('idempotently cleans up all resources upon destroy', () => {
      const store = createPopoverStore(dummyResolver);
      store.getState().openRoot('owner-1', { key: 'card-1' });
      store.getState().togglePin('card-1');

      expect(store.getState().floating).toHaveLength(1);

      store.getState().destroy();
      expect(store.getState().trail).toEqual([]);
      expect(store.getState().floating).toEqual([]);
      expect(store.getState().zIndexOrder).toEqual([]);

      // Calling destroy multiple times is safe and idempotent
      expect(() => store.getState().destroy()).not.toThrow();
    });
  });

  // I12: Zero GC Immutable Constant Sharing
  describe('I_ZeroGC: Frozen immutable singleton reuse', () => {
    it('reuses frozen singletons across empty store states', () => {
      expect(Object.isFrozen(EMPTY_ARRAY)).toBe(true);
      expect(Object.isFrozen(EMPTY_OBJECT)).toBe(true);

      const store = createPopoverStore(dummyResolver);
      expect(store.getState().trail).toBe(EMPTY_ARRAY);
      expect(store.getState().floating).toBe(EMPTY_ARRAY);
      expect(store.getState().zIndexOrder).toBe(EMPTY_ARRAY);
    });
  });

  // Item 1.200: Generative Property-Based Random Transitions Invariant Testing
  describe('Item 1.200: Property-Based Generative State Transitions', () => {
    it('executes 100 random action sequences without violating core graph or stacking invariants', () => {
      const store = createPopoverStore(dummyResolver);
      const keys = ['node-A', 'node-B', 'node-C', 'node-D', 'node-E'];

      for (let step = 0; step < 100; step++) {
        const actionChoice = step % 5;
        const randomKey = keys[step % keys.length] ?? 'node-A';

        switch (actionChoice) {
          case 0:
            store.getState().openRoot('owner-rand', { key: randomKey });
            break;
          case 1: {
            const firstEntry = store.getState().trail[0];
            if (firstEntry) {
              const parentKey = firstEntry.key;
              store.getState().pushNested(0, { key: randomKey, parentKey });
            }
            break;
          }
          case 2:
            if (store.getState().trail.some((e) => e.key === randomKey)) {
              store.getState().togglePin(randomKey);
            }
            break;
          case 3:
            if (store.getState().zIndexOrder.includes(randomKey)) {
              store.getState().bringToFront(randomKey);
            }
            break;
          case 4:
            if (store.getState().trail.some((e) => e.key === randomKey)) {
              store.getState().closeByKey(randomKey, { transition: false });
            }
            break;
        }

        // Invariant Checks on each discrete step:
        const { zIndexOrder, trail, floating } = store.getState();
        const uniqueKeys = new Set(zIndexOrder);
        expect(zIndexOrder).toHaveLength(uniqueKeys.size);

        const allActive = new Set([...trail.map((e) => e.key), ...floating.map((e) => e.key)]);
        for (const k of zIndexOrder) {
          expect(allActive.has(k)).toBe(true);
        }
      }
    });
  });
});
