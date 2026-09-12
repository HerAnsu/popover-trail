import { describe, expect, it } from 'vitest';
import * as fc from 'fast-check';
import { createPersistenceSlice } from './createPersistenceSlice';
import { createSliceTestHarness } from '../../../testing';
import type { StateStorageEngine } from '../../../types';

const createMockStorage = (initial?: string): StateStorageEngine => {
  let store = initial ?? null;
  return {
    getItem: () => store,
    setItem: (_k, v) => {
      store = v;
    },
    removeItem: () => {
      store = null;
    },
  };
};

const maliciousPayloadArb = fc.record({
  floating: fc.array(
    fc.record({
      key: fc.constantFrom('__proto__', 'constructor', 'prototype', '   ', 'card-1', 'card-2'),
      data: fc.anything(),
    }),
  ),
  offsets: fc.dictionary(
    fc.constantFrom('__proto__', 'constructor', 'card-1', 'card-2'),
    fc.record({
      x: fc.oneof(fc.integer(), fc.constant(Number.NaN), fc.constant(Number.POSITIVE_INFINITY)),
      y: fc.integer(),
    }),
  ),
  pinnedStates: fc.dictionary(fc.string(), fc.anything()),
  zIndexOrder: fc.array(fc.string()),
});

describe('createPersistenceSlice property-based invariant test suite', () => {
  it('guarantees Storage Envelope Robustness against fuzzed and malicious payloads', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.oneof(
          fc.string(),
          fc.json(),
          maliciousPayloadArb.map((o) => JSON.stringify(o)),
        ),
        async (rawPayload) => {
          const storage = createMockStorage(rawPayload);
          const harness = createSliceTestHarness(createPersistenceSlice);
          const result = await harness.actions.rehydrateState({ storage });
          expect(typeof result).toBe('boolean');
          const state = harness.getState();
          expect((Object.prototype as Record<string, unknown>)['polluted']).toBeUndefined();
          for (const entry of state.floating) {
            expect(['__proto__', 'constructor', 'prototype', '']).not.toContain(entry.key.trim());
          }
          for (const [key, offset] of Object.entries(state.offsets)) {
            expect(['__proto__', 'constructor', 'prototype']).not.toContain(key);
            if (offset) {
              expect(Number.isFinite(offset.x)).toBe(true);
              expect(Number.isFinite(offset.y)).toBe(true);
            }
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it('verifies round-trip persistence invertibility for valid floating state snapshots', async () => {
    const validKeys = fc.constantFrom('card-1', 'card-2', 'card-3');
    const offsetVal = fc.record({
      x: fc.integer({ min: -100, max: 100 }),
      y: fc.integer({ min: -100, max: 100 }),
    });

    await fc.assert(
      fc.asyncProperty(
        fc.array(validKeys, { minLength: 1, maxLength: 3 }),
        fc.dictionary(validKeys, offsetVal),
        async (cardKeys, offsets) => {
          const storage = createMockStorage();
          const harness = createSliceTestHarness(createPersistenceSlice);
          const expectedKeys = [...new Set(cardKeys)];
          const initialFloating = expectedKeys.map((key) => ({
            key,
            isLoading: false,
            error: null,
          }));
          harness.setState({
            floating: initialFloating,
            offsets,
            pinnedStates: {},
            zIndexOrder: expectedKeys,
          });
          await harness.actions.persistState({ storage });

          const rehydrateHarness = createSliceTestHarness(createPersistenceSlice);
          const success = await rehydrateHarness.actions.rehydrateState({ storage });
          expect(success).toBe(true);
          expect(rehydrateHarness.getState().floating.map(({ key }) => key)).toEqual(expectedKeys);
        },
      ),
      { numRuns: 80 },
    );
  });
});
