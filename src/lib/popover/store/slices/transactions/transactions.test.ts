import { describe, expect, it, vi } from 'vitest';
import { createTransactionsSlice } from './createTransactionsSlice';
import { createSliceTestHarness } from '../../../testing';

describe('createTransactionsSlice module', () => {
  it('executes batchUpdates with startBatch and endBatch', () => {
    const startBatchSpy = vi.fn();
    const endBatchSpy = vi.fn();
    const harness = createSliceTestHarness(
      createTransactionsSlice,
      {},
      { startBatch: startBatchSpy, endBatch: endBatchSpy },
    );

    const updateFn = vi.fn();
    harness.actions.batchUpdates(updateFn);

    expect(startBatchSpy).toHaveBeenCalled();
    expect(updateFn).toHaveBeenCalled();
    expect(endBatchSpy).toHaveBeenCalled();
  });

  it('registers middleware via useMiddleware method', () => {
    const harness = createSliceTestHarness(createTransactionsSlice);
    const useSpy = vi.spyOn(harness.context.deps.middlewareEngine, 'use');

    const mw: import('../../../types').PopoverMiddleware = (patch) => patch;

    const unsub = harness.actions.useMiddleware(mw);
    expect(useSpy).toHaveBeenCalledWith(mw);
    expect(typeof unsub).toBe('function');
  });

  it('runs React transition scheduler via runTransition', () => {
    const scheduleTransition = vi.fn((cb: () => void) => cb());
    const harness = createSliceTestHarness(createTransactionsSlice, {}, { scheduleTransition });

    const transitionAction = vi.fn();
    harness.actions.runTransition(transitionAction);

    expect(scheduleTransition).toHaveBeenCalled();
    expect(transitionAction).toHaveBeenCalled();
  });

  it('supports history manager canUndo, canRedo, undo and redo operations', () => {
    const harness = createSliceTestHarness(createTransactionsSlice);

    expect(harness.actions.canUndo()).toBe(false);
    expect(harness.actions.canRedo()).toBe(false);

    // Call undo and redo when stack is empty without errors
    harness.actions.undo();
    harness.actions.redo();
    expect(harness.getState().trail).toBeDefined();
  });

  it('pushes snapshots into history manager and applies undo state', () => {
    const harness = createSliceTestHarness(createTransactionsSlice, {
      ownerId: 'initial-state',
      trail: [{ key: 'card-1', isLoading: false, error: null }],
    });

    const snapshot = harness.getState();
    harness.context.deps.historyManager?.pushSnapshot(snapshot);
    expect(harness.actions.canUndo()).toBe(true);

    harness.setState({ ownerId: 'modified-state' });
    harness.actions.undo();
    expect(harness.getState().ownerId).toBe('initial-state');
    expect(harness.actions.canRedo()).toBe(true);
  });
});
