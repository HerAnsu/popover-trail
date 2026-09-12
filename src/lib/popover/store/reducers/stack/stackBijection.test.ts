import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { createPopoverStore } from '../../core/storeFactory';
import { getNextZIndexOrder } from './stackZIndex';

describe('I_ZBijection: Bijective Stacking Invariants', () => {
  const KEYS = ['node-1', 'node-2', 'node-3', 'node-4', 'node-5'] as const;
  type Key = (typeof KEYS)[number];
  const MUTABLE_KEYS: Key[] = [...KEYS];

  type Command =
    | { type: 'openRoot'; key: Key }
    | { type: 'openNested'; key: Key }
    | { type: 'togglePin'; key: Key }
    | { type: 'bringToFront'; key: Key }
    | { type: 'close'; key: Key };

  const commandArb: fc.Arbitrary<Command> = fc.record({
    type: fc.constantFrom('openRoot', 'openNested', 'togglePin', 'bringToFront', 'close'),
    key: fc.constantFrom(...MUTABLE_KEYS),
  });

  it('preserves strict bijection zIndexOrder -> {1, ..., |V|} across random store operations', () => {
    fc.assert(
      fc.property(fc.array(commandArb, { minLength: 5, maxLength: 30 }), (commands) => {
        const store = createPopoverStore();

        for (const cmd of commands) {
          const state = store.getState();
          switch (cmd.type) {
            case 'openRoot':
              state.openRoot('owner-gen', { key: cmd.key });
              break;
            case 'openNested': {
              const first = state.trail[0];
              if (first) {
                state.pushNested(0, { key: cmd.key, parentKey: first.key });
              }
              break;
            }
            case 'togglePin':
              if (
                state.trail.some((e) => e.key === cmd.key) ||
                state.floating.some((e) => e.key === cmd.key)
              ) {
                state.togglePin(cmd.key);
              }
              break;
            case 'bringToFront':
              if (state.zIndexOrder.includes(cmd.key)) {
                state.bringToFront(cmd.key);
              }
              break;
            case 'close':
              if (
                state.trail.some((e) => e.key === cmd.key) ||
                state.floating.some((e) => e.key === cmd.key)
              ) {
                state.closeByKey(cmd.key, { transition: false });
              }
              break;
          }

          const current = store.getState();
          const activeKeys = new Set([
            ...current.trail.map((e) => e.key),
            ...current.floating.map((e) => e.key),
          ]);
          const zSet = new Set(current.zIndexOrder);

          // Invariant 1: No duplicates (strictly injective)
          expect(zSet.size).toBe(current.zIndexOrder.length);

          // Invariant 2: Exact cardinality match to |V|
          expect(current.zIndexOrder).toHaveLength(activeKeys.size);

          // Invariant 3: Equivalence with active keys V (surjective onto V)
          expect(zSet).toEqual(activeKeys);

          // Invariant 4: Bijection to {1, ..., |V|}
          const mappedRanks = new Set<number>();
          for (const key of activeKeys) {
            const rank = current.zIndexOrder.indexOf(key) + 1;
            expect(rank).toBeGreaterThanOrEqual(1);
            expect(rank).toBeLessThanOrEqual(activeKeys.size);
            mappedRanks.add(rank);
          }
          expect(mappedRanks.size).toBe(activeKeys.size);
        }
      }),
      { numRuns: 50 },
    );
  });

  it('guarantees getNextZIndexOrder is a pure bijection for arbitrary active key subsets', () => {
    fc.assert(
      fc.property(
        fc.subarray(MUTABLE_KEYS, { minLength: 0 }),
        fc.constantFrom(...MUTABLE_KEYS),
        (activeArray, targetKey) => {
          const activeKeys = new Set(activeArray);
          const initialOrder: Key[] = [...activeArray].toReversed();

          const nextOrder = getNextZIndexOrder<Key>(initialOrder, activeKeys, targetKey);
          const nextSet = new Set(nextOrder);

          expect(nextSet.size).toBe(nextOrder.length);
          expect(nextSet).toEqual(activeKeys);
          expect(nextOrder).toHaveLength(activeKeys.size);

          if (activeKeys.has(targetKey)) {
            expect(nextOrder.at(-1)).toBe(targetKey);
          }
        },
      ),
      { numRuns: 100 },
    );
  });
});
