import { describe, it, expect } from 'vitest';
import {
  isSchemaNode,
  isSchemaDefinition,
  isValidSchemaChildKey,
  isValidSchemaKey,
  hasSchemaResolver,
} from './schemaGuards';

describe('schemaGuards', () => {
  const dummyResolver = () => ({});

  it('validates PopoverSchemaNode candidates', () => {
    expect(isSchemaNode({ resolver: dummyResolver, defaultPlacement: 'top' })).toBe(true);
    expect(isSchemaNode({ resolver: dummyResolver, children: ['child-1', 'child-2'] })).toBe(true);
    expect(isSchemaNode({ defaultPlacement: 'top' })).toBe(false);
    expect(isSchemaNode({ resolver: dummyResolver, children: 'not-array' })).toBe(false);
    expect(isSchemaNode({ resolver: dummyResolver, defaultPlacement: 'invalid-placement' })).toBe(
      false,
    );
    expect(isSchemaNode(null)).toBe(false);
  });

  it('validates PopoverSchemaDefinition collections', () => {
    const validDef = {
      root: { resolver: dummyResolver, defaultPlacement: 'bottom' as const },
      child: { resolver: dummyResolver, children: [] },
    };
    expect(isSchemaDefinition(validDef)).toBe(true);
    expect(isSchemaDefinition({ root: { resolver: dummyResolver, children: 123 } })).toBe(false);
    expect(isSchemaDefinition(null)).toBe(false);
  });

  it('checks child key existence with isValidSchemaChildKey', () => {
    const schema = {
      itemA: { resolver: dummyResolver },
      itemB: { resolver: dummyResolver },
    };
    expect(isValidSchemaChildKey(schema, 'itemA')).toBe(true);
    expect(isValidSchemaChildKey(schema, 'itemC')).toBe(false);
    expect(isValidSchemaChildKey(schema, null)).toBe(false);
  });

  it('checks valid schema key membership with isValidSchemaKey', () => {
    const schema = {
      popoverA: { resolver: dummyResolver },
      popoverB: { resolver: dummyResolver },
    };
    expect(isValidSchemaKey(schema, 'popoverA')).toBe(true);
    expect(isValidSchemaKey(schema, 'popoverB')).toBe(true);
    expect(isValidSchemaKey(schema, 'popoverX')).toBe(false);
    expect(isValidSchemaKey(schema, 42)).toBe(false);
    expect(isValidSchemaKey(schema, null)).toBe(false);
  });

  it('checks active resolver presence with hasSchemaResolver', () => {
    expect(hasSchemaResolver({ resolver: dummyResolver })).toBe(true);
    expect(hasSchemaResolver({ resolver: 'not-a-fn' })).toBe(false);
    expect(hasSchemaResolver(null)).toBe(false);
    expect(hasSchemaResolver({})).toBe(false);
  });
});
