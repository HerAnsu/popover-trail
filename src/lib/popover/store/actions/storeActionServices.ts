/**
 * Store Action Pipeline, Timer, and History Services Contracts.
 *
 * @module storeActionServices
 */

import type { PopoverStateData } from '../../types';
import type { PopoverTransitionScheduler } from '../scheduler/transitionScheduler';
import type { ResolvePopoverEntryParams } from '../storeResolverPipeline';
import type { HistoryManager, HistorySnapshot } from '../history/history';

export interface StoreAsyncPipelineService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  activeControllers: Map<string, AbortController>;
  inFlightPromises: Map<string, Promise<TData>>;
  abortControllersForKeys: (keys: Iterable<TPopoverKey>) => void;
  abortAllControllers: () => void;
  incrementRootCounter: () => number;
  isRootStale: (startedCounter: number) => boolean;
  incrementNestedCounter: (parentKey: string) => number;
  isNestedStale: (parentKey: string, startedCounter: number) => boolean;
  markAllCountersStale: () => void;
  resolvePopoverEntry: (
    params: ResolvePopoverEntryParams<TData, TContext, TPopoverKey>,
  ) => Promise<void>;
}

export interface StoreTimerService<TPopoverKey extends string = string> {
  readonly transitionScheduler: PopoverTransitionScheduler<TPopoverKey>;
}

export interface StoreHistoryService<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  pushSnapshot: (state: PopoverStateData<TData, TContext, TPopoverKey>) => void;
  clearHistory: () => void;
  readonly undoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  readonly redoStack: readonly HistorySnapshot<TData, TPopoverKey>[];
  historyManager?: HistoryManager<TData, TPopoverKey, TContext>;
}
