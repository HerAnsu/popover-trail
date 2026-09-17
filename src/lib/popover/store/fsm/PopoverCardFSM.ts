/**
 * Discrete Finite State Automaton Interpreter for Individual Popover Cards.
 *
 * @module store/fsm/PopoverCardFSM
 */

import type {
  PopoverFSMEvent,
  PopoverFSMState,
  PopoverStateValue,
  FSMSubscriber,
  PopoverFSMInterpreter,
} from './fsmTypes';
import { STATE_VALUE_TO_BIT_MAP, FSMStatusBit } from './fsmMatrix';
import { buildInitialFSMState, type PopoverFSMOptions } from './fsmInitializer';
import { transitionFSMState } from './fsmTransitions';
import { isResolvedFSM } from './fsmGuards';
import { safeCallback } from '../../utils/safeCallback';

export type { PopoverFSMInterpreter } from './fsmTypes';

export class PopoverCardFSM<
  TData = unknown,
  TPopoverKey extends string = string,
> implements PopoverFSMInterpreter<TData, TPopoverKey> {
  private state: PopoverFSMState<TData, TPopoverKey>;
  private readonly subscribers = new Set<FSMSubscriber<TData, TPopoverKey>>();
  private isDisposed = false;

  constructor(keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>) {
    this.state = buildInitialFSMState(keyOrOptions);
  }

  public getState(): PopoverFSMState<TData, TPopoverKey> {
    return this.state;
  }

  public getStatusBit(): number {
    return STATE_VALUE_TO_BIT_MAP[this.state.value];
  }

  public matches(value: PopoverStateValue): boolean {
    return this.state.value === value;
  }

  public isActive(): boolean {
    return (this.getStatusBit() & FSMStatusBit.Active) !== 0;
  }

  public isResolved(): boolean {
    return isResolvedFSM(this.state);
  }

  public send(event: PopoverFSMEvent<TData, TPopoverKey>): PopoverFSMState<TData, TPopoverKey> {
    if (this.isDisposed) return this.state;
    const nextState = transitionFSMState(this.state, event);
    if (nextState !== this.state) {
      this.state = nextState;
      this.notifySubscribers();
    }
    return this.state;
  }

  public subscribe(listener: FSMSubscriber<TData, TPopoverKey>): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  public dispose(): void {
    if (this.isDisposed) return;
    this.isDisposed = true;
    this.subscribers.clear();
  }

  public [Symbol.dispose](): void {
    this.dispose();
  }

  private notifySubscribers(): void {
    for (const sub of this.subscribers)
      safeCallback(sub, [this.state], { contextName: 'FSMSubscriber' });
  }
}

/**
 * Creates an isolated finite state machine interpreter for a single popover card.
 */
export function createPopoverFSM<TData = unknown, TPopoverKey extends string = string>(
  keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>,
): PopoverCardFSM<TData, TPopoverKey> {
  return new PopoverCardFSM(keyOrOptions);
}
