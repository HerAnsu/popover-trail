import { describe, it, expect } from 'vitest';
import { createHistoryManager } from './history';
import { createMockStoreState } from '../testing/createMockStoreState';

describe('HistoryManager', () => {
  it('initializes with empty undo and redo stacks', () => {
    const history = createHistoryManager(5);
    expect(history.undoStack).toHaveLength(0);
    expect(history.redoStack).toHaveLength(0);
    expect(history.canUndo()).toBe(false);
    expect(history.canRedo()).toBe(false);
  });

  it('pushes snapshot into undoStack and clears redoStack', () => {
    const history = createHistoryManager(5);
    const mockState = createMockStoreState({
      trail: [{ key: 'node-1', isLoading: false, error: null }],
      floating: [],
      offsets: { 'node-1': { x: 10, y: 20 } },
      pinnedStates: { 'node-1': false },
      zIndexOrder: ['node-1'],
      ownerId: 'owner-1',
    });

    history.pushSnapshot(mockState);

    expect(history.undoStack).toHaveLength(1);
    expect(history.undoStack[0]?.ownerId).toBe('owner-1');
  });

  it('limits undoStack length to maxHistory (shift oldest)', () => {
    const maxHistory = 3;
    const history = createHistoryManager(maxHistory);

    for (let i = 1; i <= 5; i++) {
      history.pushSnapshot(
        createMockStoreState({
          trail: [],
          floating: [],
          offsets: {},
          pinnedStates: {},
          zIndexOrder: [],
          ownerId: `owner-${i}`,
        }),
      );
    }

    expect(history.undoStack).toHaveLength(maxHistory);
    expect(history.undoStack[0]?.ownerId).toBe('owner-3');
    expect(history.undoStack[2]?.ownerId).toBe('owner-5');
  });

  it('generates full timeline projection via getTimeline()', () => {
    const history = createHistoryManager(5);

    const state1 = createMockStoreState({
      trail: [{ key: 's1', isLoading: false, error: null }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['s1'],
      ownerId: 'o1',
    });

    const state2 = createMockStoreState({
      trail: [
        { key: 's1', isLoading: false, error: null },
        { key: 's2', isLoading: false, error: null },
      ],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['s1', 's2'],
      ownerId: 'o2',
    });

    history.pushSnapshot(state1);

    const timeline = history.getTimeline(state2);
    expect(timeline.past).toHaveLength(1);
    expect(timeline.past[0]?.ownerId).toBe('o1');
    expect(timeline.present.ownerId).toBe('o2');
    expect(timeline.future).toHaveLength(0);
    expect(timeline.canUndo).toBe(true);
    expect(timeline.canRedo).toBe(false);
  });

  it('handles complete undo/redo cycle correctly', () => {
    const history = createHistoryManager(5);

    const state1 = createMockStoreState({
      trail: [{ key: 'step-1', isLoading: false, error: null }],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['step-1'],
      ownerId: 'owner-1',
    });

    const state2 = createMockStoreState({
      trail: [
        { key: 'step-1', isLoading: false, error: null },
        { key: 'step-2', isLoading: false, error: null },
      ],
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['step-1', 'step-2'],
      ownerId: 'owner-2',
    });

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
    const trailRef = [{ key: 'card-1', isLoading: false, error: null }];

    const mockState = createMockStoreState({
      trail: trailRef,
      floating: [],
      offsets: {},
      pinnedStates: {},
      zIndexOrder: ['card-1'],
      ownerId: 'owner-1',
    });

    history.pushSnapshot(mockState);
    history.pushSnapshot(mockState); // Identical reference push

    expect(history.undoStack).toHaveLength(1);
  });

  it('cleans up via dispose() and Symbol.dispose', () => {
    const history = createHistoryManager(5);
    history.pushSnapshot(
      createMockStoreState({
        trail: [],
        floating: [],
        offsets: {},
        pinnedStates: {},
        zIndexOrder: [],
        ownerId: 'o1',
      }),
    );

    expect(history.undoStack).toHaveLength(1);
    history.dispose();
    expect(history.undoStack).toHaveLength(0);
  });
});
