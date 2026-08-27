import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import {
  executeWithTransition,
  isSafeKey,
  rollbackTransactionState,
  safeJsonParse,
  sanitizePersistedEntries,
  sanitizePersistedOffsets,
} from './persistenceHelpers';

describe('slices/persistenceHelpers', () => {
  describe('isSafeKey', () => {
    it('accepts plain non-blank keys and rejects pollution vectors and blanks', () => {
      expect(isSafeKey('valid-key')).toBe(true);
      expect(isSafeKey('__proto__')).toBe(false);
      expect(isSafeKey('constructor')).toBe(false);
      expect(isSafeKey('prototype')).toBe(false);
      expect(isSafeKey('   ')).toBe(false);
      expect(isSafeKey(42)).toBe(false);
    });
  });

  describe('sanitizePersistedOffsets', () => {
    it('keeps only finite offsets of allowed keys', () => {
      const allowed = new Set(['a']);
      const clean = sanitizePersistedOffsets(
        { a: { x: 1, y: 2 }, b: { x: 9, y: 9 }, bad: { x: Number.NaN, y: 0 } },
        allowed,
      );
      expect(clean).toEqual({ a: { x: 1, y: 2 } });
    });
  });

  describe('sanitizePersistedEntries', () => {
    it('strips callbacks and unsafe keys from persisted entries', () => {
      const entries = [
        { key: 'ok', isLoading: false, error: null, onClose: () => {} },
        { key: '__proto__', isLoading: false, error: null },
      ] as unknown as TrailEntry<unknown, string>[];

      const clean = sanitizePersistedEntries(entries);
      expect(clean).toHaveLength(1);
      expect(Object.hasOwn(clean[0] as object, 'onClose')).toBe(false);
    });
  });

  describe('safeJsonParse', () => {
    it('returns null on malformed JSON instead of throwing', () => {
      expect(safeJsonParse('{not json')).toBeNull();
      expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    });
  });

  describe('executeWithTransition', () => {
    it('routes through the injected scheduler when provided', () => {
      const scheduler = vi.fn((cb: () => void) => cb());
      let ran = false;

      executeWithTransition(() => (ran = true), scheduler);
      expect(scheduler).toHaveBeenCalledTimes(1);
      expect(ran).toBe(true);
    });

    it('executes synchronously without a scheduler', () => {
      let ran = false;
      executeWithTransition(() => (ran = true));
      expect(ran).toBe(true);
    });
  });

  describe('rollbackTransactionState', () => {
    it('restores snapshot fields and rebuilds the DAG', () => {
      const set = vi.fn();
      const dag = {
        clear: vi.fn(),
        addNode: vi.fn(),
        removeNode: vi.fn(),
      };
      const controllers = new Map<string, AbortController>();
      const stale = new AbortController();
      controllers.set('stale', stale);

      const snapshot = {
        trail: [{ key: 'r1' } as TrailEntry<unknown, string>],
        floating: [],
        offsets: {},
        pinnedStates: {},
        zIndexOrder: ['r1'],
        ownerId: 'owner',
        anchorElement: null,
        anchorRect: null,
        nestedHydrationRequestCounters: {},
      };

      rollbackTransactionState<unknown, unknown, string>(
        snapshot as unknown as Parameters<typeof rollbackTransactionState>[0],
        null,
        controllers,
        dag,
        set,
      );

      expect(dag.clear).toHaveBeenCalled();
      expect(dag.addNode).toHaveBeenCalledWith('r1', undefined);
      // Controllers absent from the snapshot are aborted and evicted.
      expect(stale.signal.aborted).toBe(true);
      expect(controllers.size).toBe(0);
      expect(set).toHaveBeenCalledTimes(1);
    });
  });
});
