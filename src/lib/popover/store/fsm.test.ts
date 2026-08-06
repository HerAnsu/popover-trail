import { describe, it, expect } from 'vitest';
import {
  createPopoverFSM,
  popoverFSMReducer,
  assertPopoverFSMState,
  isValidTransitionStatusChange,
  type PopoverFSMEvent,
} from './fsm';

describe('Popover FSM Engine', () => {
  it('should start in Idle state', () => {
    const fsm = createPopoverFSM('card-1');
    expect(fsm.getState().value).toBe('Idle');
    expect(fsm.matches('Idle')).toBe(true);
  });

  it('should transition from Idle to Hydrating on OPEN_ROOT', () => {
    const fsm = createPopoverFSM('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    expect(fsm.getState().value).toBe('Hydrating');
  });

  it('should transition from Hydrating to Resolved.Trailing on RESOLVE_SUCCESS', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: 'hello' });
    expect(fsm.getState().value).toBe('Resolved.Trailing');
    expect(fsm.getState().context.data).toBe('hello');
  });

  it('should transition between Trailing and Pinned on TOGGLE_PIN', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: 'hello' });

    fsm.send({ type: 'TOGGLE_PIN', rect: { top: 100, left: 200 } });
    expect(fsm.getState().value).toBe('Resolved.Pinned');
    expect(fsm.getState().context.pinnedPos).toEqual({ top: 100, left: 200 });

    fsm.send({ type: 'TOGGLE_PIN' });
    expect(fsm.getState().value).toBe('Resolved.Trailing');
    expect(fsm.getState().context.pinnedPos).toBeUndefined();
  });

  it('should handle RESOLVE_FAILURE and RETRY', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    const err = new Error('Network fail');
    fsm.send({ type: 'RESOLVE_FAILURE', error: err });
    expect(fsm.getState().value).toBe('Error');
    expect(fsm.getState().context.error).toBe(err);

    fsm.send({ type: 'RETRY' });
    expect(fsm.getState().value).toBe('Hydrating');
    expect(fsm.getState().context.error).toBeUndefined();
  });

  it('should ignore illegal transitions (Zero-Invalid-State Invariant)', () => {
    const state = popoverFSMReducer({ value: 'Hydrating', context: { key: 'card-1' } }, {
      type: 'TOGGLE_PIN',
    } as PopoverFSMEvent);
    expect(state.value).toBe('Hydrating');
  });

  it('should notify subscribers on valid transitions', () => {
    const fsm = createPopoverFSM('card-1');
    const states: string[] = [];
    const unsubscribe = fsm.subscribe((s) => states.push(s.value));

    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: {} });

    expect(states).toEqual(['Hydrating', 'Resolved.Trailing']);

    unsubscribe();
    fsm.send({ type: 'CLOSE' });
    // Subscriber should not be notified after unsubscribing
    expect(states).toEqual(['Hydrating', 'Resolved.Trailing']);
  });

  it('handles Unmounting exit transition lifecycle and returns to Idle on TRANSITION_END', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: 'data' });

    fsm.send({ type: 'CLOSE' });
    expect(fsm.getState().value).toBe('Unmounting');

    fsm.send({ type: 'TRANSITION_END' });
    expect(fsm.getState().value).toBe('Idle');
    expect(fsm.getState().context.data).toBeUndefined();
  });

  it('ignores stale RESOLVE_SUCCESS when state was transition-ended to Idle', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'CLOSE' });
    fsm.send({ type: 'TRANSITION_END' });
    expect(fsm.getState().value).toBe('Idle');

    // Late arriving promise result
    fsm.send({ type: 'RESOLVE_SUCCESS', data: 'stale' });
    expect(fsm.getState().value).toBe('Idle');
    expect(fsm.getState().context.data).toBeUndefined();
  });

  it('verifies state using assertPopoverFSMState helper and isValidTransitionStatusChange', () => {
    const fsm = createPopoverFSM<string>('card-1');
    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: 'test-data' });

    expect(() => assertPopoverFSMState(fsm.getState(), 'Resolved.Trailing')).not.toThrow();
    expect(() => assertPopoverFSMState(fsm.getState(), 'Idle')).toThrow(
      /Expected FSM state "Idle"/,
    );

    expect(isValidTransitionStatusChange('mounting', 'mounted')).toBe(true);
    expect(isValidTransitionStatusChange('unmounting', 'mounted')).toBe(false);
  });

  it('returns unchanged state for unhandled unknown events', () => {
    const initialState = { value: 'Idle' as const, context: { key: 'card-1' } };
    // @ts-expect-error Testing invalid event type
    const nextState = popoverFSMReducer(initialState, { type: 'UNKNOWN_EVENT' });
    expect(nextState).toBe(initialState);
  });
});
