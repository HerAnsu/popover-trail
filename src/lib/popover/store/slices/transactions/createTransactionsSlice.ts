/**
 * Multi-action Transactions & Middleware Domain Action Slice for popover-trail.
 *
 * @module store/slices/transactions/createTransactionsSlice
 */

import type { TransactionsSliceActions } from '../../../types';
import { isErr, wrapAsyncResult } from '../../../utils/result';
import { logger } from '../../../utils/logger';
import type { TransactionsSliceContext } from '../context';
import {
  applyHistorySnapshot,
  rollbackControllers,
  rollbackTransactionState,
} from '../../transactions/transactionHelpers';
import { getActiveKeys } from '../trail/dagHelpers';

const executeWithTransition = (action: () => void, schedule?: (cb: () => void) => void) =>
  schedule ? schedule(action) : action();

/**
 * Creates the Transactions, History, and Middleware slice.
 *
 * @example
 * ```ts
 * const txSlice = createTransactionsSlice(ctx);
 * await txSlice.transaction(async (actions) => {
 *   actions.openRoot('root');
 *   actions.pushNested('child', 'root');
 * });
 * ```
 *
 * @template TData - Resolved popover data payload type.
 * @template TContext - Global shared store context type.
 * @template TPopoverKey - Union of valid popover keys.
 * @param ctx - Slice context container with Zustand accessors and deps.
 * @returns Transactions, history navigation (undo/redo), and middleware actions.
 */
export function createTransactionsSlice<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  ctx: TransactionsSliceContext<TData, TContext, TPopoverKey>,
): TransactionsSliceActions<TData, TContext, TPopoverKey> {
  const { set, get, deps } = ctx;
  const {
    activeControllers,
    startBatch,
    endBatch,
    middlewareEngine,
    historyManager,
    popoverDAG,
    dispatchEffects,
    scheduleTransition,
  } = deps;

  const handleHistoryTransition = (
    targetSnapshot: Parameters<typeof applyHistorySnapshot<TData, TContext, TPopoverKey>>[0],
  ) => {
    const { floating, trail } = get();
    const currentKeys = getActiveKeys(floating, trail);
    const snapshotKeys = getActiveKeys(targetSnapshot.floating, targetSnapshot.trail);
    const evictedKeys: TPopoverKey[] = [];
    for (const k of currentKeys) {
      if (!snapshotKeys.has(k)) evictedKeys.push(k);
    }
    if (evictedKeys.length > 0) {
      dispatchEffects([
        { type: 'ABORT_IN_FLIGHT', keys: evictedKeys },
        { type: 'CANCEL_TIMERS', keys: evictedKeys },
      ]);
    }
    applyHistorySnapshot(targetSnapshot, popoverDAG, set);
  };

  return {
    batchUpdates: (fn) => {
      startBatch();
      try {
        fn(get().actions);
      } finally {
        endBatch();
      }
    },
    runTransition: (fn) => executeWithTransition(() => fn(get().actions), scheduleTransition),
    useMiddleware: (middleware) => middlewareEngine.use(middleware),
    canUndo: () => historyManager?.canUndo() ?? false,
    canRedo: () => historyManager?.canRedo() ?? false,
    undo: () => {
      const prev = historyManager?.undo(get());
      if (prev) handleHistoryTransition(prev);
    },
    redo: () => {
      const next = historyManager?.redo(get());
      if (next) handleHistoryTransition(next);
    },
    transaction: async (fn) => {
      const snapshotState = get();
      const { actions, debug } = snapshotState;
      const snapshotControllers =
        activeControllers.size > 0 ? new Set(activeControllers.keys()) : null;
      const txResult = await wrapAsyncResult(Promise.resolve().then(() => fn(actions)));
      if (isErr(txResult)) {
        if (debug) logger.error('[popover-trail]: Transaction Rollback:', txResult.error);
        const { floating, trail } = get();
        const currentActiveKeys = getActiveKeys(floating, trail);
        dispatchEffects([{ type: 'CANCEL_TIMERS', keys: [...currentActiveKeys] }]);
        rollbackTransactionState<TData, TContext, TPopoverKey>(snapshotState, popoverDAG, set);
        rollbackControllers(activeControllers, snapshotControllers);
        return false;
      }
      return true;
    },
  };
}
