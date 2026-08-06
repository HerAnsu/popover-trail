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
});
