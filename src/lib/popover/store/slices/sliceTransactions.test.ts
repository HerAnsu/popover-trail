import { describe, it, expect } from 'vitest';
import { createTransactionsSlice } from './sliceTransactions';
import { createMockSliceContext } from '../../testing/createMockSliceContext';

describe('sliceTransactions module', () => {
  const createMockContext = () =>
    createMockSliceContext<unknown, unknown, string>({ floating: [], trail: [] });

  it('restores PopoverDAG hierarchy nodes on undo and redo', () => {
    const ctx = createMockContext();
    const transactions = createTransactionsSlice(ctx);

    // Initial state with root
    ctx.state = {
      ...ctx.state,
      trail: [{ key: 'h-root', isLoading: false, error: null }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['h-root'],
      ownerId: 'o1',
    };
    ctx.deps.historyManager?.pushSnapshot(ctx.state);

    // Modified state with child
    ctx.state = {
      ...ctx.state,
      trail: [
        { key: 'h-root', isLoading: false, error: null },
        { key: 'h-child', parentKey: 'h-root', isLoading: false, error: null },
      ],
      zIndexOrder: ['h-root', 'h-child'],
    };
    ctx.deps.popoverDAG?.addNode('h-root');
    ctx.deps.popoverDAG?.addNode('h-child', 'h-root');

    // Undo -> should restore DAG to only have h-root
    transactions.undo();
    expect(ctx.deps.popoverDAG?.hasNode('h-child')).toBe(false);
    expect(ctx.deps.popoverDAG?.hasNode('h-root')).toBe(true);

    // Redo -> should restore DAG to have h-child again
    transactions.redo();
    expect(ctx.deps.popoverDAG?.hasNode('h-child')).toBe(true);
  });
});
