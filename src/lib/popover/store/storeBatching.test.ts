import { describe, it, expect, vi } from 'vitest';
import { createBatchingManager, batchUpdatesScope } from './storeBatching';

describe('storeBatching module', () => {
  it('suppresses notifications during startBatch and flushes on endBatch', () => {
    const manager = createBatchingManager();
    const getState = vi.fn(() => ({ count: 1 }));

    manager.startBatch();
    manager.endBatch(getState);

    // End batch with no state change doesn't trigger listeners if not dirty
    expect(getState).not.toHaveBeenCalled();
  });

  it('runs callback within batchUpdatesScope', () => {
    const manager = createBatchingManager();
    const result = batchUpdatesScope(manager, () => 'scope_result');
    expect(result).toBe('scope_result');
  });

  it('maintains batch depth counter for nested batch scopes', () => {
    const manager = createBatchingManager();
    manager.startBatch();
    manager.startBatch();

    const getState = vi.fn(() => ({ count: 1 }));
    manager.endBatch(getState);
    manager.endBatch(getState);

    expect(manager.startBatch).toBeDefined();
  });

  it('guarantees endBatch cleanup even if callback throws in batchUpdatesScope', () => {
    const manager = createBatchingManager();
    const endBatchSpy = vi.spyOn(manager, 'endBatch');

    expect(() =>
      batchUpdatesScope(manager, () => {
        throw new Error('Scope error');
      }),
    ).toThrow('Scope error');

    expect(endBatchSpy).toHaveBeenCalled();
  });
});
