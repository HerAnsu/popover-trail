import { describe, it, expect } from 'vitest';
import { isDAGNode, isRootDAGNode, isLeafDAGNode } from './dagGuards';
import type { DAGNode } from './dagTypes';

describe('dagGuards', () => {
  it('identifies valid DAGNode objects', () => {
    const validNode: DAGNode = {
      key: 'node-1',
      parentKeys: new Set(),
      childrenKeys: new Set(['child-1']),
      depth: 0,
    };
    expect(isDAGNode(validNode)).toBe(true);

    expect(isDAGNode({ key: 'n1', depth: -1, childrenKeys: new Set() })).toBe(false);
    expect(isDAGNode({ key: 'n1', depth: Number.NaN, childrenKeys: new Set() })).toBe(false);
    expect(isDAGNode({ key: '', depth: 0, childrenKeys: new Set() })).toBe(false);
    expect(isDAGNode({ key: 'n1', depth: 0, childrenKeys: [] })).toBe(false);
    expect(isDAGNode(null)).toBe(false);
  });

  it('detects root and leaf nodes correctly', () => {
    const rootNode: DAGNode = {
      key: 'root',
      parentKeys: new Set(),
      childrenKeys: new Set(['child']),
      depth: 0,
    };
    const leafNode: DAGNode = {
      key: 'child',
      parentKey: 'root',
      parentKeys: new Set(['root']),
      childrenKeys: new Set(),
      depth: 1,
    };
    const isolatedNode: DAGNode = {
      key: 'iso',
      parentKeys: new Set(),
      childrenKeys: new Set(),
      depth: 0,
    };

    expect(isRootDAGNode(rootNode)).toBe(true);
    expect(isRootDAGNode(leafNode)).toBe(false);

    expect(isLeafDAGNode(leafNode)).toBe(true);
    expect(isLeafDAGNode(rootNode)).toBe(false);

    // Isolated node is both root and leaf
    expect(isRootDAGNode(isolatedNode)).toBe(true);
    expect(isLeafDAGNode(isolatedNode)).toBe(true);
  });
});
