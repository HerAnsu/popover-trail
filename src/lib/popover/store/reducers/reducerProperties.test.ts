import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import {
  getNextZIndexOrder,
  updateOffsetState,
  togglePinState,
  areEntriesShallowEqual,
} from './index';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('reducerProperties fast-check invariants', () => {
  it('Property: getNextZIndexOrder always places newKey at end and maintains set equality with activeKeys', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 10 }), { minLength: 1, maxLength: 15 }),
        fc.string({ minLength: 1, maxLength: 10 }),
        (initialKeys, targetKey) => {
          const activeKeys = new Set([...initialKeys, targetKey]);
          const nextOrder = getNextZIndexOrder(initialKeys, activeKeys, targetKey);

          expect(nextOrder.at(-1)).toBe(targetKey);
          expect(new Set(nextOrder)).toEqual(activeKeys);
          expect(nextOrder).toHaveLength(activeKeys.size);
        },
      ),
    );
  });

  it('Property: updateOffsetState is idempotent for identical coordinates', () => {
    fc.assert(
      fc.property(
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        fc.float({ noNaN: true, noDefaultInfinity: true }),
        (x, y) => {
          const state = createMockStoreState({ offsets: { k1: { x, y } } });
          const patch = updateOffsetState(state, 'k1', { x, y });
          expect(patch).toEqual({});
        },
      ),
    );
  });

  it('Property: togglePinState preserves active key cardinality', () => {
    fc.assert(
      fc.property(
        fc.uniqueArray(fc.string({ minLength: 1, maxLength: 8 }), { minLength: 1, maxLength: 6 }),
        (keys) => {
          const trail = keys.map((k) => ({ key: k, isLoading: false }));
          const state = createMockStoreState({ trail, zIndexOrder: keys });
          const targetKey = keys[0] ?? 'fallback-key';

          const pinPatch = togglePinState(state, targetKey);
          const nextFloating = pinPatch.floating ?? [];
          const nextTrail = pinPatch.trail ?? [];
          expect(nextFloating.length + nextTrail.length).toBe(keys.length);
        },
      ),
    );
  });

  it('Property: areEntriesShallowEqual is reflexive for any entry', () => {
    fc.assert(
      fc.property(fc.string({ minLength: 1, maxLength: 8 }), fc.boolean(), (key, isLoading) => {
        const entry = { key, isLoading, error: null };
        expect(areEntriesShallowEqual(entry, entry)).toBe(true);
      }),
    );
  });
});
