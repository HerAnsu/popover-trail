import { describe, it, expect } from 'vitest';
import { createHistoryManager } from './history';
import type { PopoverStore } from '../types';

describe('HistoryManager', () => {
  it('initializes with empty undo and redo stacks', () => {
    const history = createHistoryManager(5);
    expect(history.undoStack).toHaveLength(0);
    expect(history.redoStack).toHaveLength(0);
  });

  it('pushes snapshot into undoStack and clears redoStack', () => {
    const history = createHistoryManager(5);
    const mockState = {
      trail: [{ key: 'node-1' }],
      floating: [],
      offsets: { 'node-1': { x: 10, y: 20 } },
      pinnedStates: { 'node-1': false },
      zIndexOrder: ['node-1'],
      ownerId: 'owner-1',
    } as unknown as PopoverStore;

    history.pushSnapshot(mockState);

    expect(history.undoStack).toHaveLength(1);
    expect(history.undoStack[0]?.ownerId).toBe('owner-1');
  });

  it('limits undoStack length to maxHistory (shift oldest)', () => {
    const maxHistory = 3;
    const history = createHistoryManager(maxHistory);

    for (let i = 1; i <= 5; i++) {
      history.pushSnapshot({
        trail: [],
        floating: [],
        offsets: {},
        pinnedStates: {},
        zIndexOrder: [],
        ownerId: `owner-${i}`,
      } as unknown as PopoverStore);
    }

    expect(history.undoStack).toHaveLength(maxHistory);
    expect(history.undoStack[0]?.ownerId).toBe('owner-3');
    expect(history.undoStack[2]?.ownerId).toBe('owner-5');
  });

  it('clears undoStack and redoStack on clearHistory()', () => {
    const history = createHistoryManager(5);
    history.pushSnapshot({
      trail: [],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: [],
      ownerId: 'owner-1',
    } as unknown as PopoverStore);

    expect(history.undoStack).toHaveLength(1);
    history.clearHistory();
    expect(history.undoStack).toHaveLength(0);
    expect(history.redoStack).toHaveLength(0);
  });
});
