/**
 * Transaction & History Domain Action Slice for popover-trail.
 * Encapsulates batching, React transitions, middleware registration,
 * undo/redo time travel, and rollback-guaranteed transactions.
 *
 * @module store/slices/sliceTransactions
 */

import type { PopoverActions } from '../../types';
import { getSnapshotStatePatch } from '../reducers/stackReducers';
import { isErr, wrapAsyncResult } from '../../utils/result';
import type { SliceContext } from './sliceContext';
import {
  executeWithTransition,
  rollbackTransactionState,
  restoreDAGFromState,
} from './persistenceHelpers';

/**
 * Factory creating transaction and history actions
 * (`batchUpdates`, `runTransition`, `useMiddleware`, `undo`, `redo`, `transaction`).
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Popover key string union.
 * @param ctx - Store dependency injection slice context.
 * @returns Transaction and history action dispatch methods.
 */
export function createTransactionsSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(ctx: SliceContext<TData, TContext, TPopoverKey>) {
  const { set, get, deps } = ctx;
  const { activeControllers, startBatch, endBatch, middlewareEngine } = deps;

  const getCurrentState = () => get();

  return {
    batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => {
      startBatch();
      try {
        fn(get().actions);
      } finally {
        endBatch();
      }
    },

    runTransition: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => {
      executeWithTransition(() => {
        fn(get().actions);
      }, deps.scheduleTransition);
    },

    useMiddleware: (middleware: Parameters<typeof middlewareEngine.use>[0]) =>
      middlewareEngine.use(middleware),

    canUndo: () => (deps.historyManager ? deps.historyManager.canUndo() : false),
    canRedo: () => (deps.historyManager ? deps.historyManager.canRedo() : false),

    undo: () => {
      if (deps.historyManager) {
        const prev = deps.historyManager.undo(get());
        if (prev) {
          restoreDAGFromState(deps.popoverDAG, prev.trail, prev.floating);
          set(getSnapshotStatePatch(prev));
        }
      }
    },

    redo: () => {
      if (deps.historyManager) {
        const next = deps.historyManager.redo(get());
        if (next) {
          restoreDAGFromState(deps.popoverDAG, next.trail, next.floating);
          set(getSnapshotStatePatch(next));
        }
      }
    },

    transaction: async (
      fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
    ) => {
      const snapshotState = getCurrentState();
      const snapshotControllers =
        activeControllers.size > 0 ? new Set(activeControllers.keys()) : null;

      const txResult = await wrapAsyncResult(Promise.resolve().then(() => fn(get().actions)));

      if (isErr(txResult)) {
        if (getCurrentState().debug) {
          console.error('[popover-trail]: Transaction Rollback:', txResult.error);
        }
        rollbackTransactionState<TData, TContext, TPopoverKey>(
          snapshotState,
          snapshotControllers,
          activeControllers,
          deps.popoverDAG,
          set,
        );
        return false;
      }

      return true;
    },
  };
}
