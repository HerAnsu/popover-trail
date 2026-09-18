import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { createTransactionsSlice } from './createTransactionsSlice';
import { createSliceTestHarness } from '../../../testing';
import type { PopoverStateData } from '../../../types';

const keyArb = fc.constantFrom('k1', 'k2', 'k3', 'k4');
const entryArb = fc.record({
  key: keyArb,
  isLoading: fc.boolean(),
  error: fc.constant(null),
});
const offsetArb = fc.record({
  x: fc.integer({ min: -100, max: 100 }),
  y: fc.integer({ min: -100, max: 100 }),
});

const stateGen = fc.record<Partial<PopoverStateData<unknown, unknown, string>>>({
  ownerId: fc.option(fc.string({ minLength: 1, maxLength: 6 }), { nil: null }),
  trail: fc.array(entryArb, { maxLength: 3 }),
  floating: fc.array(entryArb, { maxLength: 2 }),
  pinnedStates: fc.dictionary(keyArb, fc.boolean()),
  offsets: fc.dictionary(keyArb, offsetArb),
  zIndexOrder: fc.array(keyArb, { maxLength: 4 }),
});

describe('createTransactionsSlice property-based invariant test suite', () => {
  it('guarantees Transaction Rollback Invariant on transaction abortion', async () => {
    await fc.assert(
      fc.asyncProperty(stateGen, stateGen, async (initialState, mutatedPatch) => {
        const harness = createSliceTestHarness(createTransactionsSlice, initialState);
        const snapshot = { ...harness.getState() };

        const success = await harness.actions.transaction(() => {
          harness.setState(mutatedPatch);
          throw new Error('Transaction failure simulation');
        });

        expect(success).toBe(false);
        const rolledBack = harness.getState();
        expect(rolledBack.ownerId).toEqual(snapshot.ownerId);
        expect(rolledBack.trail).toEqual(snapshot.trail);
        expect(rolledBack.floating).toEqual(snapshot.floating);
        expect(rolledBack.offsets).toEqual(snapshot.offsets);
        expect(rolledBack.pinnedStates).toEqual(snapshot.pinnedStates);
        expect(rolledBack.zIndexOrder).toEqual(snapshot.zIndexOrder);
      }),
      { numRuns: 100 },
    );
  });

  it('verifies Reversible Undo/Redo Invertibility: delta(delta(S, a), a^-1) = S', () => {
    fc.assert(
      fc.property(stateGen, stateGen, (initialState, nextState) => {
        const harness = createSliceTestHarness(createTransactionsSlice, initialState);
        const historyMgr = harness.context.deps.historyManager;

        historyMgr?.pushSnapshot(harness.getState());
        harness.setState(nextState);

        expect(harness.actions.canUndo()).toBe(true);
        harness.actions.undo();
        expect(harness.getState().ownerId).toEqual(initialState.ownerId ?? null);
        expect(harness.getState().trail).toEqual(initialState.trail ?? []);
        expect(harness.getState().floating).toEqual(initialState.floating ?? []);

        expect(harness.actions.canRedo()).toBe(true);
        harness.actions.redo();
        expect(harness.getState().ownerId).toEqual(nextState.ownerId ?? null);
        expect(harness.getState().trail).toEqual(nextState.trail ?? []);
        expect(harness.getState().floating).toEqual(nextState.floating ?? []);
      }),
      { numRuns: 100 },
    );
  });
});
