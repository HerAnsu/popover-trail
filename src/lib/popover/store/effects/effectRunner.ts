/**
 * Declarative Side-Effect Runner for PopoverTrail Store Transitions.
 * Executes decoupled side effect descriptors within isolated fault boundaries.
 *
 * @module store/effects/effectRunner
 */

import type { Effect } from './effectTypes';
import { notifyUserCallback } from './effectCallbacks';
import { dispatchStoreEvent } from '../eventBus';
import { handleHistorySnapshot, type EffectRunnerDependencies } from './effectRunnerTypes';

export type { EffectRunnerDependencies } from './effectRunnerTypes';

function runSingleEffect<TData, TPopoverKey extends string, TContext>(
  effect: Effect<TData, TPopoverKey, TContext>,
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void {
  const { transitionScheduler, popoverDAG, eventBus, eventListeners } = deps;

  switch (effect.type) {
    case 'CANCEL_TIMERS':
      transitionScheduler?.cancelAllForKeys(effect.keys);
      break;
    case 'CANCEL_TIMER_FOR_KEY':
      transitionScheduler?.cancelAllForKey(effect.key);
      break;
    case 'CANCEL_ALL_TIMERS':
      transitionScheduler?.clear();
      break;
    case 'SCHEDULE_TIMER':
      if (effect.kind === 'exit') {
        transitionScheduler?.scheduleExitTransition(effect.key, effect.duration, () =>
          deps.onExitComplete?.(effect.key),
        );
      }
      break;
    case 'SCHEDULE_BATCH_TIMER':
      transitionScheduler?.scheduleBatch(effect.duration, effect.onComplete);
      break;
    case 'ABORT_IN_FLIGHT':
      deps.abortControllersForKeys?.(effect.keys);
      break;
    case 'ABORT_ALL_IN_FLIGHT':
      deps.abortAllControllers?.();
      break;
    case 'ADD_DAG_NODE':
      popoverDAG?.addNode(effect.key, effect.parentKey);
      break;
    case 'ADD_DAG_EDGE':
      popoverDAG?.addEdge(effect.parentKey, effect.childKey);
      break;
    case 'REMOVE_DAG_EDGE':
      popoverDAG?.removeEdge(effect.parentKey, effect.childKey);
      break;
    case 'PRUNE_DAG':
      for (const k of effect.keys) popoverDAG?.removeNode(k);
      break;
    case 'CLEAR_DAG':
      popoverDAG?.clear();
      break;
    case 'RECORD_HISTORY_SNAPSHOT':
      handleHistorySnapshot(effect, deps);
      break;
    case 'NOTIFY_USER_CALLBACK': {
      const entry = deps.findEntryByKey?.(effect.key);
      if (entry) notifyUserCallback(entry, effect.callbackType, effect.key, effect.payload);
      break;
    }
    case 'EMIT_EVENT':
      if (deps.emitStoreEvent) deps.emitStoreEvent(effect.event);
      else dispatchStoreEvent(eventListeners, effect.event, eventBus);
      break;
    case 'RESET_STORE':
      deps.resetStoreState?.();
      break;
    default:
      break;
  }
}

export function runEffects<TData, TPopoverKey extends string = string, TContext = unknown>(
  effects: readonly Effect<TData, TPopoverKey, TContext>[],
  deps: EffectRunnerDependencies<TData, TPopoverKey, TContext>,
): void {
  for (const effect of effects) runSingleEffect(effect, deps);
}
