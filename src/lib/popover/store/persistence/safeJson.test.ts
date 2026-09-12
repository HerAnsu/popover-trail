import { describe, it, expect } from 'vitest';
import { safeJsonStringify, safeJsonParse, serializeJson } from './safeJson';

interface UserPayload {
  readonly name: string;
  readonly role?: string;
}

function isUserPayload(val: unknown): val is UserPayload {
  return typeof val === 'object' && val !== null && 'name' in val && typeof val.name === 'string';
}

describe('safeJson module', () => {
  it('stringifies primitives, objects, and arrays correctly', () => {
    expect(safeJsonStringify({ a: 1, b: 'hello' })).toBe('{"a":1,"b":"hello"}');
    expect(safeJsonStringify([1, 2, 3])).toBe('[1,2,3]');
    expect(safeJsonStringify(42)).toBe('42');
    expect(safeJsonStringify('test')).toBe('"test"');
    expect(safeJsonStringify(null)).toBe('null');
    expect(serializeJson({ key: 'val' })).toBe('{"key":"val"}');
  });

  it('safely handles circular references and returns valid JSON', () => {
    interface CircularNode {
      readonly id: string;
      self?: CircularNode;
    }
    const node: CircularNode = { id: 'root' };
    const mutableNode = node as { id: string; self?: CircularNode };
    mutableNode.self = node;

    const stringified = safeJsonStringify(node);
    expect(stringified).toBe('{"id":"root"}');
    expect(() => JSON.parse(stringified)).not.toThrow();
  });

  it('handles undefined and invalid values gracefully without throwing', () => {
    expect(safeJsonStringify(undefined)).toBe('null');
    expect(safeJsonStringify(() => {})).toBe('null');
    expect(safeJsonStringify(Symbol('test'))).toBe('null');
  });

  it('parses valid JSON strings and validates with type guards', () => {
    const raw = '{"name":"Alice","role":"admin"}';
    const parsed = safeJsonParse(raw, isUserPayload);

    expect(parsed).not.toBeNull();
    if (parsed !== null) {
      expect(parsed.name).toBe('Alice');
      expect(parsed.role).toBe('admin');
    }
  });

  it('returns null on invalid JSON strings, whitespace, and non-string inputs', () => {
    expect(safeJsonParse('{invalid-json')).toBeNull();
    expect(safeJsonParse('')).toBeNull();
    expect(safeJsonParse('   ')).toBeNull();
    expect(safeJsonParse(null)).toBeNull();
    expect(safeJsonParse(123)).toBeNull();
    expect(safeJsonParse(undefined)).toBeNull();
  });

  it('returns null if parsed JSON fails the type guard check', () => {
    const raw = '{"differentKey":"value"}';
    const parsed = safeJsonParse(raw, isUserPayload);
    expect(parsed).toBeNull();
  });

  it('prevents prototype pollution when parsing malicious JSON payloads', () => {
    const maliciousProto = '{"__proto__":{"polluted":"yes"}}';
    const parsedProto = safeJsonParse<Record<string, unknown>>(maliciousProto);
    expect(parsedProto).not.toBeNull();

    const cleanObject: { polluted?: string } = {};
    expect(cleanObject.polluted).toBeUndefined();
    expect(Object.hasOwn(Object.prototype, 'polluted')).toBe(false);

    const maliciousConstructor = '{"constructor":{"prototype":{"polluted":"yes"}}}';
    const parsedConstructor = safeJsonParse<Record<string, unknown>>(maliciousConstructor);
    expect(parsedConstructor).not.toBeNull();
    expect(cleanObject.polluted).toBeUndefined();
  });
});
