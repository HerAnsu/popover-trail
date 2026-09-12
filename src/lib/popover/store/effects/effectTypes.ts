/**
 * Declarative Effect Plan & Side-Effect Type System for PopoverTrail.
 *
 * @module store/effects/effectTypes
 */

import type { PopoverStoreEvent, StatePatch, PopoverStateData } from '../../types';

export type UserCallbackType = 'onClose' | 'onPin' | 'onOpen';
export type TimerKind = 'hover' | 'exit';

export type Effect<TData = unknown, TPopoverKey extends string = string, TContext = unknown> =
  | { readonly type: 'CANCEL_TIMERS'; readonly keys: readonly TPopoverKey[] }
  | { readonly type: 'CANCEL_TIMER_FOR_KEY'; readonly key: TPopoverKey }
  | { readonly type: 'CANCEL_ALL_TIMERS' }
  | {
      readonly type: 'SCHEDULE_TIMER';
      readonly key: TPopoverKey;
      readonly duration: number;
      readonly kind: TimerKind;
    }
  | {
      readonly type: 'SCHEDULE_BATCH_TIMER';
      readonly duration: number;
      readonly onComplete: () => void;
    }
  | { readonly type: 'ABORT_IN_FLIGHT'; readonly keys: readonly TPopoverKey[] }
  | { readonly type: 'ABORT_ALL_IN_FLIGHT' }
  | {
      readonly type: 'ADD_DAG_NODE';
      readonly key: TPopoverKey;
      readonly parentKey?: TPopoverKey;
    }
  | {
      readonly type: 'ADD_DAG_EDGE';
      readonly parentKey: TPopoverKey;
      readonly childKey: TPopoverKey;
    }
  | {
      readonly type: 'REMOVE_DAG_EDGE';
      readonly parentKey: TPopoverKey;
      readonly childKey: TPopoverKey;
    }
  | { readonly type: 'PRUNE_DAG'; readonly keys: readonly TPopoverKey[] }
  | { readonly type: 'CLEAR_DAG' }
  | {
      readonly type: 'RECORD_HISTORY_SNAPSHOT';
      readonly state?: PopoverStateData<TData, TContext, TPopoverKey>;
    }
  | {
      readonly type: 'NOTIFY_USER_CALLBACK';
      readonly key: TPopoverKey;
      readonly callbackType: UserCallbackType;
      readonly payload?: unknown;
    }
  | { readonly type: 'EMIT_EVENT'; readonly event: PopoverStoreEvent<TData, TPopoverKey> }
  | { readonly type: 'RESET_STORE' };

export interface StateTransitionPlan<
  TData = unknown,
  TPopoverKey extends string = string,
  TContext = unknown,
> {
  readonly nextPatch: StatePatch<TData, TContext, TPopoverKey>;
  readonly effects: readonly Effect<TData, TPopoverKey, TContext>[];
}
