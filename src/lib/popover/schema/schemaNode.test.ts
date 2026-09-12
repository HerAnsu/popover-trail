import { describe, it, expect } from 'vitest';
import {
  defineSchemaNode,
  getAllowedChildren,
  hasAllowedChild,
} from './schemaNode';

describe('schemaNode', () => {
  interface UserData {
    readonly id: string;
    readonly name: string;
  }

  interface UserContext {
    readonly tenantId: string;
  }

  it('instantiates strongly-typed schema node with defineSchemaNode factory', async () => {
    const userNode = defineSchemaNode<UserData, unknown, UserContext>({
      resolver: async (key: string, _parentData, context) => ({
        id: key,
        name: `User-${context?.tenantId ?? 'default'}`,
      }),
      placement: 'right',
      offset: 12,
      children: ['billing', 'settings'] as const,
    });

    expect(typeof userNode.resolver).toBe('function');
    expect(userNode.placement).toBe('right');
    expect(userNode.offset).toBe(12);

    const result = await userNode.resolver('user-1', undefined, { tenantId: 'acme' });
    expect(result).toEqual({ id: 'user-1', name: 'User-acme' });
  });

  it('extracts allowed children from schema node definitions', () => {
    const nodeWithChildren = defineSchemaNode({
      resolver: () => ({ status: 'ok' }),
      children: ['child-a', 'child-b'],
    });

    const nodeWithoutChildren = defineSchemaNode({
      resolver: () => ({ status: 'empty' }),
    });

    expect(getAllowedChildren(nodeWithChildren)).toEqual(['child-a', 'child-b']);
    expect(getAllowedChildren(nodeWithoutChildren)).toEqual([]);
  });

  it('checks child key inclusion with hasAllowedChild', () => {
    const parentNode = defineSchemaNode({
      resolver: () => null,
      children: ['details', 'audit-log'],
    });

    expect(hasAllowedChild(parentNode, 'details')).toBe(true);
    expect(hasAllowedChild(parentNode, 'audit-log')).toBe(true);
    expect(hasAllowedChild(parentNode, 'unrelated')).toBe(false);

    const leafNode = defineSchemaNode({ resolver: () => null });
    expect(hasAllowedChild(leafNode, 'details')).toBe(false);
  });

  it('preserves popover display metadata configuration', () => {
    const richNode = defineSchemaNode({
      resolver: () => 'data',
      placement: 'bottom-start',
      offset: 16,
      allowDragWhenPinned: true,
      allowDragWhenUnpinned: false,
      baseZIndex: 200,
    });

    expect(richNode.placement).toBe('bottom-start');
    expect(richNode.offset).toBe(16);
    expect(richNode.allowDragWhenPinned).toBe(true);
    expect(richNode.allowDragWhenUnpinned).toBe(false);
    expect(richNode.baseZIndex).toBe(200);
  });
});
