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

  it('handles complete undo/redo cycle correctly', () => {
    const history = createHistoryManager(5);

    const state1 = {
      trail: [{ key: 'step-1' }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['step-1'],
      ownerId: 'owner-1',
    } as unknown as PopoverStore;

    const state2 = {
      trail: [{ key: 'step-1' }, { key: 'step-2' }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['step-1', 'step-2'],
      ownerId: 'owner-2',
    } as unknown as PopoverStore;

    history.pushSnapshot(state1);
    history.pushSnapshot(state2);

    expect(history.canUndo()).toBe(true);

    const poppedUndo = history.undo(state2);
    expect(poppedUndo?.ownerId).toBe('owner-2');
    expect(history.canRedo()).toBe(true);

    const poppedRedo = history.redo(state1);
    expect(poppedRedo?.ownerId).toBe('owner-2');
  });

  it('deduplicates identical consecutive snapshots', () => {
    const history = createHistoryManager(5);
    const trailRef = [{ key: 'card-1' }];

    const mockState = {
      trail: trailRef,
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['card-1'],
      ownerId: 'owner-1',
    } as unknown as PopoverStore;

    history.pushSnapshot(mockState);
    history.pushSnapshot(mockState); // Identical reference push

    expect(history.undoStack).toHaveLength(1);
  });
});
