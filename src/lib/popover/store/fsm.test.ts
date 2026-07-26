import { describe, it, expect } from 'vitest';
import { createPopoverFSM, popoverFSMReducer } from './fsm';

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
    fsm.subscribe((s) => states.push(s.value));

    fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
    fsm.send({ type: 'RESOLVE_SUCCESS', data: {} });

    expect(states).toEqual(['Hydrating', 'Resolved.Trailing']);
  });
});
