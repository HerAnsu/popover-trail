import { describe, it, expect, vi } from 'vitest';
import { runEffects } from './effectRunner';
import type { Effect } from './effectTypes';
import type { PopoverStateData } from '../../types';

describe('runEffects', () => {
  it('executes cancel timers and abort controllers', () => {
    const cancelAllForKeys = vi.fn();
    const cancelAllForKey = vi.fn();
    const clear = vi.fn();
    const abortControllersForKeys = vi.fn();
    const abortAllControllers = vi.fn();

    const effects: Effect[] = [
      { type: 'CANCEL_TIMERS', keys: ['k1', 'k2'] },
      { type: 'CANCEL_TIMER_FOR_KEY', key: 'k3' },
      { type: 'CANCEL_ALL_TIMERS' },
      { type: 'ABORT_IN_FLIGHT', keys: ['k1'] },
      { type: 'ABORT_ALL_IN_FLIGHT' },
    ];

    runEffects(effects, {
      transitionScheduler: {
        cancelAllForKeys,
        cancelAllForKey,
        clear,
      } as never,
      abortControllersForKeys,
      abortAllControllers,
    });

    expect(cancelAllForKeys).toHaveBeenCalledWith(['k1', 'k2']);
    expect(cancelAllForKey).toHaveBeenCalledWith('k3');
    expect(clear).toHaveBeenCalledTimes(1);
    expect(abortControllersForKeys).toHaveBeenCalledWith(['k1']);
    expect(abortAllControllers).toHaveBeenCalledTimes(1);
  });

  it('handles DAG lifecycle effects (ADD_DAG_NODE, PRUNE_DAG, CLEAR_DAG)', () => {
    const addNode = vi.fn();
    const removeNode = vi.fn();
    const clear = vi.fn();

    const effects: Effect[] = [
      { type: 'ADD_DAG_NODE', key: 'nodeA', parentKey: 'root' },
      { type: 'PRUNE_DAG', keys: ['n1', 'n2'] },
      { type: 'CLEAR_DAG' },
    ];

    runEffects(effects, {
      popoverDAG: { addNode, removeNode, clear } as never,
    });

    expect(addNode).toHaveBeenCalledWith('nodeA', 'root');
    expect(removeNode).toHaveBeenCalledWith('n1');
    expect(removeNode).toHaveBeenCalledWith('n2');
    expect(clear).toHaveBeenCalledTimes(1);
  });

  it('notifies user callbacks (onClose, onPin, onOpen) with safe error isolation', () => {
    const onClose = vi.fn();
    const onPin = vi.fn();
    const onOpen = vi.fn();
    const findEntryByKey = vi.fn((key: string) => ({
      key,
      onClose,
      onPin,
      onOpen,
    }));

    const effects: Effect[] = [
      { type: 'NOTIFY_USER_CALLBACK', key: 'card1', callbackType: 'onClose' },
      { type: 'NOTIFY_USER_CALLBACK', key: 'card2', callbackType: 'onPin', payload: true },
      { type: 'NOTIFY_USER_CALLBACK', key: 'card3', callbackType: 'onOpen' },
    ];

    runEffects(effects, { findEntryByKey });

    expect(onClose).toHaveBeenCalledWith('card1');
    expect(onPin).toHaveBeenCalledWith('card2', true);
    expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ key: 'card3' }));
  });

  it('handles scheduling timers and batch completion', () => {
    const scheduleExitTransition = vi.fn((_key, _duration, cb) => cb());
    const scheduleBatch = vi.fn((_duration, cb) => cb());
    const onExitComplete = vi.fn();
    const onBatchComplete = vi.fn();

    const effects: Effect[] = [
      { type: 'SCHEDULE_TIMER', key: 'card1', duration: 150, kind: 'exit' },
      { type: 'SCHEDULE_BATCH_TIMER', duration: 200, onComplete: onBatchComplete },
    ];

    runEffects(effects, {
      transitionScheduler: {
        scheduleExitTransition,
        scheduleBatch,
      } as never,
      onExitComplete,
    });

    expect(scheduleExitTransition).toHaveBeenCalledWith('card1', 150, expect.any(Function));
    expect(onExitComplete).toHaveBeenCalledWith('card1');
    expect(scheduleBatch).toHaveBeenCalledWith(200, onBatchComplete);
    expect(onBatchComplete).toHaveBeenCalled();
  });

  it('handles snapshot recording and store reset', () => {
    const pushSnapshot = vi.fn();
    const resetStoreState = vi.fn();
    const mockState = { ownerId: 'test' } as PopoverStateData;

    const effects: Effect[] = [
      { type: 'RECORD_HISTORY_SNAPSHOT', state: mockState },
      { type: 'RECORD_HISTORY_SNAPSHOT' },
      { type: 'RESET_STORE' },
    ];

    runEffects(effects, {
      pushSnapshot,
      getStoreState: () => mockState,
      resetStoreState,
    });

    expect(pushSnapshot).toHaveBeenCalledTimes(2);
    expect(pushSnapshot).toHaveBeenCalledWith(mockState);
    expect(resetStoreState).toHaveBeenCalledTimes(1);
  });

  it('handles event emission to eventListeners and eventBus', () => {
    const listener = vi.fn();
    const emit = vi.fn();

    const effects: Effect[] = [{ type: 'EMIT_EVENT', event: { type: 'clear' } }];

    runEffects(effects, {
      eventListeners: [listener],
      eventBus: { emit } as never,
    });

    expect(listener).toHaveBeenCalledWith({ type: 'clear' });
    expect(emit).toHaveBeenCalledWith('popover:clear', { type: 'clear' });
  });
});
