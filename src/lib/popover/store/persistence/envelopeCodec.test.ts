import { describe, it, expect } from 'vitest';
import {
  encodePersistedEnvelope,
  decodePersistedEnvelope,
  CURRENT_SCHEMA_VERSION,
} from './envelopeCodec';
import { createMockStoreState } from '../../testing/createMockStoreState';

describe('envelopeCodec module', () => {
  it('encodes full store state into a schema-conforming envelope', () => {
    const state = createMockStoreState<string, unknown, string>({
      ownerId: 'owner-alpha',
      trail: [{ key: 'pop-1', isLoading: false, error: null, data: 'hello' }],
      floating: [{ key: 'float-1', isLoading: false, error: null, data: 'world' }],
      offsets: { 'pop-1': { x: 10, y: 25 } },
      pinnedStates: { 'pop-1': true },
      zIndexOrder: ['pop-1', 'float-1'],
    });

    const envelope = encodePersistedEnvelope(state);

    expect(envelope.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
    expect(envelope.ownerId).toBe('owner-alpha');
    expect(envelope.trail).toHaveLength(1);
    expect(envelope.floating).toHaveLength(1);
    expect(envelope.offsets['pop-1']).toEqual({ x: 10, y: 25 });
    expect(envelope.pinnedStates['pop-1']).toBe(true);
    expect(envelope.zIndexOrder).toEqual(['pop-1', 'float-1']);
  });

  it('decodes raw JSON strings and performs valid round-trip serialization', () => {
    const state = createMockStoreState<string, unknown, string>({
      ownerId: 'owner-roundtrip',
      trail: [{ key: 'root-node', isLoading: false, error: null }],
      floating: [],
      offsets: { 'root-node': { x: 5, y: 15 } },
      pinnedStates: {},
      zIndexOrder: ['root-node'],
    });

    const original = encodePersistedEnvelope(state);
    const serialized = JSON.stringify(original);
    const decodeResult = decodePersistedEnvelope<string, string>(serialized);

    expect(decodeResult.success).toBe(true);
    if (decodeResult.success) {
      expect(decodeResult.data.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(decodeResult.data.ownerId).toBe('owner-roundtrip');
      expect(decodeResult.data.trail).toEqual([{ key: 'root-node', isLoading: false, error: null }]);
      expect(decodeResult.data.offsets['root-node']).toEqual({ x: 5, y: 15 });
      expect(decodeResult.data.zIndexOrder).toEqual(['root-node']);
    }
  });

  it('rejects non-object payloads and invalid JSON strings with an error Result', () => {
    const invalidJson = decodePersistedEnvelope('{"trail": invalid');
    expect(invalidJson.success).toBe(false);

    const primitivePayload = decodePersistedEnvelope(12345);
    expect(primitivePayload.success).toBe(false);

    const nullPayload = decodePersistedEnvelope(null);
    expect(nullPayload.success).toBe(false);

    const booleanPayload = decodePersistedEnvelope(true);
    expect(booleanPayload.success).toBe(false);
  });

  it('safely filters prototype-polluting keys and invalid coordinates during decode', () => {
    const maliciousPayload = {
      schemaVersion: 2,
      ownerId: 'clean-owner',
      trail: [
        { key: '__proto__', isLoading: false },
        { key: 'valid-entry', isLoading: false },
      ],
      floating: [{ key: 'constructor', isLoading: false }],
      offsets: {
        __proto__: { x: 999, y: 999 },
        'valid-entry': { x: 42, y: 84 },
        'bad-coords': { x: Number.NaN, y: Number.POSITIVE_INFINITY },
      },
      pinnedStates: {
        __proto__: true,
        'valid-entry': true,
      },
      zIndexOrder: ['__proto__', 'valid-entry', 'constructor'],
    };

    const result = decodePersistedEnvelope<unknown, string>(maliciousPayload);
    expect(result.success).toBe(true);

    if (result.success) {
      const envelope = result.data;
      expect(envelope.schemaVersion).toBe(2);
      expect(envelope.trail.map((e) => e.key)).toEqual(['valid-entry']);
      expect(envelope.floating).toHaveLength(0);
      expect(envelope.offsets['valid-entry']).toEqual({ x: 42, y: 84 });
      expect(envelope.offsets['bad-coords']).toBeUndefined();
      expect(envelope.pinnedStates['valid-entry']).toBe(true);
      expect(envelope.zIndexOrder).toEqual(['valid-entry']);
    }
  });

  it('falls back to default values when decoding payloads with missing properties', () => {
    const sparsePayload = {
      schemaVersion: 'not-a-number',
      ownerId: 12345,
    };

    const result = decodePersistedEnvelope<unknown, string>(sparsePayload);
    expect(result.success).toBe(true);

    if (result.success) {
      const envelope = result.data;
      expect(envelope.schemaVersion).toBe(CURRENT_SCHEMA_VERSION);
      expect(envelope.ownerId).toBeNull();
      expect(envelope.trail).toEqual([]);
      expect(envelope.floating).toEqual([]);
      expect(envelope.offsets).toEqual({});
      expect(envelope.pinnedStates).toEqual({});
      expect(envelope.zIndexOrder).toEqual([]);
    }
  });
});
