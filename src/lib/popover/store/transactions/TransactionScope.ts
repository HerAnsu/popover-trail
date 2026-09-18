import type { PopoverStateData, StatePatch } from '../../types';
import type { MaybePromise } from '../../types/utilityTypes';
import type { PopoverDAG } from '../../utils/dag';
import { rollbackTransactionState } from './transactionHelpers';
import { logger } from '../../utils/logger';
import { type Result, Ok, Err } from '../../utils/result';
import { PopoverError, PopoverErrorCode, createPopoverError } from '../../utils/errors';
import { toErrorMessage } from '../../utils/typeGuards';

/**
 * Transactional execution scope providing atomic state mutations with automatic rollback.
 * Captures an initial state snapshot on instantiation, commits on success, and restores
 * baseline state and DAG topology on uncaught exceptions or invariant failures.
 *
 * @template TData - Popover payload data type.
 * @template TContext - Global application context.
 * @template TPopoverKey - Registered string key identifiers.
 *
 * @example
 * ```typescript
 * const tx = new TransactionScope(getStoreState, setStoreState, dag);
 *
 * await tx.execute(async () => {
 *   mutateStateA();
 *   mutateStateB();
 *   // If any step throws, state rolls back automatically!
 * });
 * ```
 */
export class TransactionScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  private readonly getState: () => PopoverStateData<TData, TContext, TPopoverKey>;
  private readonly set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void;
  private readonly popoverDAG?: PopoverDAG<TPopoverKey>;
  private readonly initialSnapshot: PopoverStateData<TData, TContext, TPopoverKey>;
  private isCommitted = false;
  private isRolledBack = false;

  /**
   * Initializes a transaction scope, capturing a baseline snapshot of the store.
   *
   * @param getState - Thunk returning the current store state.
   * @param set - Store state updater function.
   * @param popoverDAG - Optional DAG hierarchy to restore on rollback.
   */
  constructor(
    getState: () => PopoverStateData<TData, TContext, TPopoverKey>,
    set: (patch: StatePatch<TData, TContext, TPopoverKey>) => void,
    popoverDAG?: PopoverDAG<TPopoverKey>,
  ) {
    this.getState = getState;
    this.set = set;
    this.popoverDAG = popoverDAG;
    this.initialSnapshot = { ...this.getState() };
  }

  /**
   * Commits the transaction, preventing subsequent rollbacks.
   *
   * @throws Error if the transaction has already been rolled back.
   */
  public commit(): void {
    if (this.isRolledBack) {
      throw new Error('[TransactionScope] Cannot commit already rolled back transaction');
    }
    this.isCommitted = true;
  }

  /**
   * Rolls back the store state and DAG hierarchy to the initial snapshot.
   * Idempotent; no-op if already committed or rolled back.
   */
  public rollback(): void {
    if (this.isCommitted || this.isRolledBack) return;
    this.isRolledBack = true;
    rollbackTransactionState(this.initialSnapshot, this.popoverDAG, this.set);
  }

  /**
   * Executes an action within this transactional boundary.
   * Commits automatically on successful resolution; rolls back and rethrows on failure.
   *
   * @template R - Return value type of the action.
   * @param action - Synchronous or asynchronous action callback.
   * @returns Result of the action.
   *
   * @example
   * ```typescript
   * const result = await tx.execute(async () => {
   *   return await fetchAndApply();
   * });
   * ```
   */
  public async execute<R>(action: () => Promise<R> | R): Promise<R> {
    try {
      const result = await action();
      this.commit();
      return result;
    } catch (error) {
      logger.error('[TransactionScope] Transaction failed, executing atomic rollback:', error);
      this.rollback();
      throw error;
    }
  }

  /**
   * Executes an action returning a Result monad (`Ok(result)` or `Err(PopoverError)`).
   * Automatically commits on success, rolls back on error, and never throws uncaught exceptions.
   *
   * @template R - Return value type.
   * @param action - Action returning a value or promise.
   * @returns `Ok(result)` on success, or `Err(PopoverError)` on failure.
   *
   * @example
   * ```typescript
   * const result = await tx.executeResult(async () => {
   *   return computeLayout();
   * });
   * if (isOk(result)) {
   *   console.log('Layout:', result.value);
   * }
   * ```
   */
  public async executeResult<R>(action: () => MaybePromise<R>): Promise<Result<R, PopoverError>> {
    try {
      const result = await action();
      this.commit();
      return Ok(result);
    } catch (error) {
      logger.error('[TransactionScope] Transaction failed, executing atomic rollback:', error);
      this.rollback();
      const popoverErr =
        error instanceof PopoverError
          ? error
          : createPopoverError(
              PopoverErrorCode.PERSIST_FAILED,
              toErrorMessage(error),
              undefined,
              error,
            );
      return Err(popoverErr);
    }
  }
}
