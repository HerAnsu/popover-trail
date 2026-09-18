import { describe, expect, it, vi } from 'vitest';
import { createTransactionsSlice } from './createTransactionsSlice';
import { createSliceTestHarness } from '../../../testing';

describe('transactions rollback protection and concurrent batching', () => {
  it('aborts new controllers and cleans activeControllers on transaction failure', async () => {
    const harness = createSliceTestHarness(createTransactionsSlice, {
      ownerId: 'initial-owner',
      trail: [{ key: 'root-1', isLoading: false, error: null }],
    });

    const initialController = new AbortController();
    const abortSpyInitial = vi.spyOn(initialController, 'abort');
    harness.context.deps.activeControllers.set('initial-key', initialController);

    const aborted = await harness.actions.transaction(() => {
      const tempController = new AbortController();
      harness.context.deps.activeControllers.set('temp-key', tempController);
      harness.setState({ ownerId: 'dirty-owner' });
      throw new Error('Failed mid-flight');
    });

    expect(aborted).toBe(false);
    expect(harness.getState().ownerId).toBe('initial-owner');
    expect(harness.context.deps.activeControllers.has('temp-key')).toBe(false);
    expect(harness.context.deps.activeControllers.has('initial-key')).toBe(true);
    expect(abortSpyInitial).not.toHaveBeenCalled();
  });

  it('handles nested transaction rollbacks cleanly without state leakage', async () => {
    const harness = createSliceTestHarness(createTransactionsSlice, {
      ownerId: 'root-owner',
      trail: [{ key: 'card-1', isLoading: false, error: null }],
    });

    const outerSuccess = await harness.actions.transaction(async () => {
      harness.setState({ ownerId: 'outer-modified' });

      // Nested failed transaction
      const innerSuccess = await harness.actions.transaction(() => {
        harness.setState({ ownerId: 'inner-corrupted' });
        throw new Error('Inner failure');
      });

      expect(innerSuccess).toBe(false);
      // Inner rollback reverts back to outer-modified state
      expect(harness.getState().ownerId).toBe('outer-modified');
    });

    expect(outerSuccess).toBe(true);
    expect(harness.getState().ownerId).toBe('outer-modified');
  });

  it('guarantees endBatch execution during concurrent and failing batchUpdates', () => {
    const startBatchSpy = vi.fn();
    const endBatchSpy = vi.fn();
    const harness = createSliceTestHarness(
      createTransactionsSlice,
      {},
      { startBatch: startBatchSpy, endBatch: endBatchSpy },
    );

    // Failing batchUpdate ensures endBatch in finally block
    expect(() => {
      harness.actions.batchUpdates(() => {
        throw new Error('Batch update error');
      });
    }).toThrow('Batch update error');

    expect(startBatchSpy).toHaveBeenCalledTimes(1);
    expect(endBatchSpy).toHaveBeenCalledTimes(1);

    // Subsequent batchUpdate runs normally
    harness.actions.batchUpdates(() => {});
    expect(startBatchSpy).toHaveBeenCalledTimes(2);
    expect(endBatchSpy).toHaveBeenCalledTimes(2);
  });
});
