import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createPopoverStore } from '../core/storeFactory';
import { createHistorySnapshot, areSnapshotsEqual } from './historySnapshotPool';
import type { HistorySnapshot } from './historyTypes';

describe('I_ReversibleJournal: Undo/Redo Homomorphism Invariants', () => {
  const KEYS = ['card-A', 'card-B', 'card-C', 'card-D'] as const;

  type ReversibleAction =
    | { type: 'openRoot'; key: (typeof KEYS)[number] }
    | { type: 'pushNested'; key: (typeof KEYS)[number] }
    | { type: 'togglePin'; key: (typeof KEYS)[number] }
    | { type: 'closeLeaf'; key: (typeof KEYS)[number] };

  const actionArb: fc.Arbitrary<ReversibleAction> = fc.record({
    type: fc.constantFrom('openRoot', 'pushNested', 'togglePin', 'closeLeaf'),
    key: fc.constantFrom(...KEYS),
  });

  function applyAction(
    store: ReturnType<typeof createPopoverStore>,
    action: ReversibleAction,
  ): boolean {
    const s = store.getState();
    const isAlreadyActive =
      s.trail.some((e) => e.key === action.key) || s.floating.some((e) => e.key === action.key);

    switch (action.type) {
      case 'openRoot': {
        if (isAlreadyActive) return false;
        s.openRoot('owner-rev', { key: action.key });
        return true;
      }
      case 'pushNested': {
        const parent = s.trail[0];
        if (!parent || parent.key === action.key || isAlreadyActive) return false;
        s.pushNested(0, { key: action.key, parentKey: parent.key });
        return true;
      }
      case 'togglePin': {
        if (!isAlreadyActive) return false;
        s.togglePin(action.key);
        return true;
      }
      case 'closeLeaf': {
        // Cascade-closing the root resets the entire store.
        // Reversible closure applies to leaf entries while parents remain active.
        if (s.trail.length <= 1) return false;
        const leaf = s.trail.at(-1);
        if (!leaf || leaf.key !== action.key) return false;
        s.closeByKey(action.key, { transition: false });
        return true;
      }
    }
  }

  function assertSnapshotsBitForBitEqual(actual: HistorySnapshot, expected: HistorySnapshot): void {
    expect(actual.ownerId).toBe(expected.ownerId);
    expect(actual.trail.map((e) => e.key)).toEqual(expected.trail.map((e) => e.key));
    expect(actual.floating.map((e) => e.key)).toEqual(expected.floating.map((e) => e.key));
    expect(actual.zIndexOrder).toEqual(expected.zIndexOrder);
    expect(actual.pinnedStates).toEqual(expected.pinnedStates);
    expect(actual.offsets).toEqual(expected.offsets);
    expect(areSnapshotsEqual(actual, expected)).toBe(true);
  }

  it('proves single-step homomorphism: apply(a) followed by undo() restores exact initial snapshot', () => {
    fc.assert(
      fc.property(actionArb, actionArb, (initialAction, targetAction) => {
        const store = createPopoverStore();
        applyAction(store, initialAction);

        const snapshotBefore = createHistorySnapshot(store.getState());
        const applied = applyAction(store, targetAction);
        const snapshotAfter = createHistorySnapshot(store.getState());

        if (!applied || areSnapshotsEqual(snapshotBefore, snapshotAfter)) return;

        expect(store.getState().canUndo()).toBe(true);
        store.getState().undo();

        const snapshotRestored = createHistorySnapshot(store.getState());
        assertSnapshotsBitForBitEqual(snapshotRestored, snapshotBefore);

        expect(store.getState().canRedo()).toBe(true);
        store.getState().redo();

        const snapshotRedone = createHistorySnapshot(store.getState());
        assertSnapshotsBitForBitEqual(snapshotRedone, snapshotAfter);
      }),
      { numRuns: 100 },
    );
  });

  it('proves multi-step homomorphism: applying sequence of mutating actions and unwinding with undo restores initial snapshot', () => {
    fc.assert(
      fc.property(fc.array(actionArb, { minLength: 2, maxLength: 8 }), (actions) => {
        const store = createPopoverStore();
        const checkpoints: HistorySnapshot[] = [];

        for (const act of actions) {
          const stateBefore = createHistorySnapshot(store.getState());
          const applied = applyAction(store, act);
          if (applied) {
            checkpoints.push(stateBefore);
          }
        }

        if (checkpoints.length === 0) return;

        // Unwind in reverse order
        for (let i = checkpoints.length - 1; i >= 0; i--) {
          const expectedSnapshot = checkpoints[i];
          if (!expectedSnapshot) continue;

          expect(store.getState().canUndo()).toBe(true);
          store.getState().undo();

          const currentSnapshot = createHistorySnapshot(store.getState());
          assertSnapshotsBitForBitEqual(currentSnapshot, expectedSnapshot);
        }

        expect(store.getState().canUndo()).toBe(false);
      }),
      { numRuns: 50 },
    );
  });
});
