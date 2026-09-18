import { describe, it, expect } from 'vitest';
import { isSafeKey, isPersistedEnvelope } from './envelopeGuards';
import type { PersistedEnvelope } from './persistenceTypes';

describe('envelopeGuards module', () => {
  describe('isSafeKey', () => {
    it('accepts valid non-empty alphanumeric strings', () => {
      expect(isSafeKey('card-1')).toBe(true);
      expect(isSafeKey('user_popover')).toBe(true);
      expect(isSafeKey('item:detail:123')).toBe(true);
    });

    it('rejects prototype-polluting property names', () => {
      expect(isSafeKey('__proto__')).toBe(false);
      expect(isSafeKey('constructor')).toBe(false);
      expect(isSafeKey('prototype')).toBe(false);
    });

    it('rejects empty strings and non-string inputs', () => {
      expect(isSafeKey('')).toBe(false);
      expect(isSafeKey(null)).toBe(false);
      expect(isSafeKey(undefined)).toBe(false);
      expect(isSafeKey(12345)).toBe(false);
      expect(isSafeKey({})).toBe(false);
      expect(isSafeKey(['key'])).toBe(false);
      expect(isSafeKey(true)).toBe(false);
    });
  });

  describe('isPersistedEnvelope', () => {
    const validEnvelope: PersistedEnvelope = {
      schemaVersion: 1,
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: 'test-owner',
    };

    it('identifies structurally valid PersistedEnvelope objects', () => {
      expect(isPersistedEnvelope(validEnvelope)).toBe(true);
    });

    it('rejects primitives, null, and non-object inputs', () => {
      expect(isPersistedEnvelope(null)).toBe(false);
      expect(isPersistedEnvelope(undefined)).toBe(false);
      expect(isPersistedEnvelope('string')).toBe(false);
      expect(isPersistedEnvelope(100)).toBe(false);
      expect(isPersistedEnvelope([])).toBe(false);
    });

    it('rejects envelopes missing required schema fields', () => {
      expect(isPersistedEnvelope({ ...validEnvelope, schemaVersion: 'one' })).toBe(false);
      expect(isPersistedEnvelope({ ...validEnvelope, trail: 'not-an-array' })).toBe(false);
      expect(isPersistedEnvelope({ ...validEnvelope, floating: null })).toBe(false);
      expect(isPersistedEnvelope({ ...validEnvelope, offsets: null })).toBe(false);
      expect(isPersistedEnvelope({ ...validEnvelope, zIndexOrder: 'not-array' })).toBe(false);
    });
  });
});
