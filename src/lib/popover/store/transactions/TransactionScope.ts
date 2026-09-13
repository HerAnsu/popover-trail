import type { PopoverStateData, StatePatch } from '../../types';
import type { MaybePromise } from '../../types/utilityTypes';
import type { PopoverDAG } from '../../utils/dag';
import { rollbackTransactionState } from './transactionHelpers';
import { logger } from '../../utils/logger';
import { type Result, Ok, Err } from '../../utils/result';
import { PopoverError, PopoverErrorCode, createPopoverError } from '../../utils/errors';
import { toErrorMessage } from '../../utils/typeGuards';

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

  public commit(): void {
    if (this.isRolledBack) {
      throw new Error('[TransactionScope] Cannot commit already rolled back transaction');
    }
    this.isCommitted = true;
  }

  public rollback(): void {
    if (this.isCommitted || this.isRolledBack) return;
    this.isRolledBack = true;
    rollbackTransactionState(this.initialSnapshot, this.popoverDAG, this.set);
  }

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
