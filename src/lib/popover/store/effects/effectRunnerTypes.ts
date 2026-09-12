/**
 * Effect Runner Dependency Contracts and State Snapshot Handlers.
 *
 * @module store/effects/effectRunnerTypes
 */

import type { Effect } from './effectTypes';
import type { PopoverDAG } from '../../utils/dag';
import type { PopoverTransitionScheduler } from '../transitionScheduler';
import type { PopoverEventBus } from '../eventBus';
import type { TrailEntry, PopoverStoreEvent, PopoverStateData } from '../../types';

export interface EffectRunnerDependencies<
  TData = unknown,
  TPopoverKey extends string = string,
  TContext = unknown,
> {
  readonly transitionScheduler?: PopoverTransitionScheduler<TPopoverKey>;
  readonly popoverDAG?: PopoverDAG<TPopoverKey>;
  readonly eventBus?: PopoverEventBus<TData, TPopoverKey>;
  readonly eventListeners?: Iterable<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
  readonly emitStoreEvent?: (event: PopoverStoreEvent<TData, TPopoverKey>) => void;
  readonly abortControllersForKeys?: (keys: Iterable<TPopoverKey>) => void;
  readonly abortAllControllers?: () => void;
  readonly recordHistorySnapshot?: (state?: PopoverStateData<TData, TContext, TPopoverKey>) => void;
  readonly pushSnapshot?: (state: PopoverStateData<TData, TContext, TPopoverKey>) => void;
  readonly getStoreState?: () => PopoverStateData<TData, TContext, TPopoverKey>;
  readonly findEntryByKey?: (key: TPopoverKey) => TrailEntry<TData, TPopoverKey> | undefined;
  readonly onExitComplete?: (key: TPopoverKey) => void;
  readonly resetStoreState?: () => void;
  readonly scheduleTransition?: (callback: () => void) => void;
}

export function handleHistorySnapshot<TData, TPopoverKey extends string, TContext>(
  effect: Extract<Effect<TData, TPopoverKey, TContext>, { type: 'RECORD_HISTORY_SNAPSHOT' }>,
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void {
  if (effect.state && deps.pushSnapshot) {
    deps.pushSnapshot(effect.state);
  } else if (deps.pushSnapshot && deps.getStoreState) {
    deps.pushSnapshot(deps.getStoreState());
  } else {
    deps.recordHistorySnapshot?.(effect.state);
  }
}
