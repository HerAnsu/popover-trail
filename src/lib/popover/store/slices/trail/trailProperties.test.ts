import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { createTrailSlice } from './createTrailSlice';
import { collectActiveKeySet } from './dagHelpers';
import { createSliceTestHarness } from '../../../testing';

const keys = ['alpha', 'beta', 'gamma', 'delta', 'epsilon'] as const;
const entryOf = (k: string) => ({ key: k, isLoading: false, error: null });

const trailOpArb = fc.oneof(
  fc.record({
    type: fc.constant('openRoot' as const),
    ownerId: fc.constantFrom('o1', 'o2'),
    key: fc.constantFrom(...keys),
  }),
  fc.record({
    type: fc.constant('pushNested' as const),
    index: fc.integer({ min: 0, max: 4 }),
    key: fc.constantFrom(...keys),
  }),
  fc.record({
    type: fc.constant('pushNestedByKey' as const),
    parentKey: fc.constantFrom(...keys),
    key: fc.constantFrom(...keys),
  }),
  fc.record({ type: fc.constant('closeByKey' as const), key: fc.constantFrom(...keys) }),
  fc.record({ type: fc.constant('closeFrom' as const), index: fc.integer({ min: 0, max: 4 }) }),
);

describe('createTrailSlice property-based invariant test suite', () => {
  it('maintains DAG Acyclicity Invariant across arbitrary operation sequences', () => {
    fc.assert(
      fc.property(fc.array(trailOpArb, { minLength: 1, maxLength: 30 }), (ops) => {
        const harness = createSliceTestHarness(createTrailSlice);
        const dag = harness.getDAG();
        if (!dag) return;

        for (const op of ops) {
          if (op.type === 'openRoot') harness.actions.openRoot(op.ownerId, entryOf(op.key));
          else if (op.type === 'pushNested') harness.actions.pushNested(op.index, entryOf(op.key));
          else if (op.type === 'pushNestedByKey')
            harness.actions.pushNestedByKey(op.parentKey, entryOf(op.key));
          else if (op.type === 'closeByKey') harness.actions.closeByKey(op.key);
          else harness.actions.closeFrom(op.index);
        }

        const zOrder = dag.getTopologicalZIndexOrder();
        expect(zOrder.size).toBe(dag.size);

        for (const [nodeKey] of zOrder) {
          const node = dag.getNode(nodeKey);
          expect(dag.getAncestors(nodeKey).has(nodeKey)).toBe(false);
          const nodeZ = zOrder.get(nodeKey);
          const parentZ = node?.parentKey ? zOrder.get(node.parentKey) : undefined;
          if (nodeZ !== undefined && parentZ !== undefined) {
            expect(nodeZ).toBeGreaterThan(parentZ);
          }
        }
      }),
      { numRuns: 100 },
    );
  });

  it('guarantees Teardown Orphan Freedom for closed subtrees', () => {
    fc.assert(
      fc.property(
        fc.array(trailOpArb, { minLength: 2, maxLength: 15 }),
        fc.integer({ min: 0, max: 4 }),
        (ops, targetIdx) => {
          const harness = createSliceTestHarness(createTrailSlice, {
            closePinnedDescendants: true,
          });
          harness.actions.openRoot('root-owner', entryOf('alpha'));

          for (const op of ops) {
            if (op.type === 'pushNested') harness.actions.pushNested(op.index, entryOf(op.key));
            else if (op.type === 'pushNestedByKey')
              harness.actions.pushNestedByKey(op.parentKey, entryOf(op.key));
          }

          const currentTrail = harness.getState().trail;
          if (currentTrail.length === 0) return;
          const targetEntry = currentTrail[targetIdx % currentTrail.length];
          if (!targetEntry) return;
          const targetKey = targetEntry.key;

          const dag = harness.getDAG();
          if (!dag) return;
          const descendants = dag.getDescendantKeys(targetKey);
          harness.actions.closeByKey(targetKey);

          const { trail, floating } = harness.getState();
          const activeKeys = collectActiveKeySet(floating, trail);

          expect(activeKeys.has(targetKey)).toBe(false);
          for (const descendant of descendants) {
            expect(activeKeys.has(descendant)).toBe(false);
            expect(dag.hasNode(descendant)).toBe(false);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
