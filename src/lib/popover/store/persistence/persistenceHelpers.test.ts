import { describe, it, expect, vi } from 'vitest';
import type { TrailEntry } from '../../types';
import {
  executeWithTransition,
  isSafeKey,
  safeJsonParse,
  safeJsonStringify,
  isPersistedEnvelope,
  sanitizePersistedEntries,
  sanitizePersistedOffsets,
  createSessionStorageAdapter,
} from './index';

describe('store/persistence/persistenceHelpers', () => {
  it('accepts plain non-blank keys and rejects pollution vectors and blanks', () => {
    expect(isSafeKey('valid-key')).toBe(true);
    expect(isSafeKey('__proto__')).toBe(false);
    expect(isSafeKey('constructor')).toBe(false);
    expect(isSafeKey('prototype')).toBe(false);
    expect(isSafeKey('   ')).toBe(false);
    expect(isSafeKey(42)).toBe(false);
  });

  it('keeps only finite offsets of allowed keys and filters unsafe keys', () => {
    const allowed = new Set(['a']);
    const clean = sanitizePersistedOffsets(
      { a: { x: 1, y: 2 }, b: { x: 9, y: 9 }, bad: { x: Number.NaN, y: 0 } },
      allowed,
    );
    expect(clean).toEqual({ a: { x: 1, y: 2 } });
  });

  it('strips callbacks and unsafe keys from persisted entries', () => {
    const entries = [
      { key: 'ok', isLoading: false, error: null, onClose: () => {} },
      { key: '__proto__', isLoading: false, error: null },
    ] as TrailEntry<unknown, string>[];

    const clean = sanitizePersistedEntries(entries);
    expect(clean).toHaveLength(1);
    expect(Object.hasOwn(clean[0] as object, 'onClose')).toBe(false);
  });

  it('handles safeJsonParse and safeJsonStringify with circular references', () => {
    expect(safeJsonParse('{not json')).toBeNull();
    expect(safeJsonParse('{"a":1}')).toEqual({ a: 1 });
    expect(safeJsonStringify(undefined)).toBe('null');

    const circular: Record<string, unknown> = { a: 1 };
    circular.self = circular;
    expect(safeJsonStringify(circular)).toBe('{"a":1}');
  });

  it('validates isPersistedEnvelope shape correctly', () => {
    expect(isPersistedEnvelope(null)).toBe(false);
    expect(
      isPersistedEnvelope({
        schemaVersion: 1,
        trail: [],
        floating: [],
        offsets: {},
        zIndexOrder: [],
      }),
    ).toBe(true);
    expect(isPersistedEnvelope({ schemaVersion: '1' })).toBe(false);
  });

  it('creates and operates a functional sessionStorage adapter with fallback', () => {
    const adapter = createSessionStorageAdapter();
    adapter.setItem('k', 'v');
    expect(adapter.getItem('k')).toBe('v');
    adapter.removeItem('k');
    expect(adapter.getItem('k')).toBeNull();
  });

  it('routes through the injected scheduler when provided in executeWithTransition', () => {
    const scheduler = vi.fn((cb: () => void) => cb());
    let ran = false;
    executeWithTransition(() => (ran = true), scheduler);
    expect(scheduler).toHaveBeenCalled();
    expect(ran).toBe(true);
  });
});
