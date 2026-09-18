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
import { createInitialFSMState, type PopoverFSMOptions } from './fsmInitializer';
import { transitionFSMState } from './fsmTransitions';
import { isResolvedFSM } from './fsmGuards';
import { safeCallback } from '../../utils/safeCallback';

export type { PopoverFSMInterpreter } from './fsmTypes';

/**
 * State machine interpreter managing the lifecycle of an individual popover card.
 *
 * Each popover card operates as an isolated finite state automaton (`Idle` -> `Hydrating`
 * -> `Resolved.Trailing` / `Resolved.Pinned` -> `Unmounting` -> `Idle`).
 * This class handles event dispatching, ensures transitions adhere to `FSM_STATE_MANIFEST`,
 * updates contextual data/errors, and notifies registered listeners on state changes.
 *
 * @template TData - Type of data payload resolved for the popover card.
 * @template TPopoverKey - String identifier type for the popover.
 *
 * @example
 * ```typescript
 * const fsm = new PopoverCardFSM('profile-card');
 *
 * fsm.subscribe((state) => {
 *   if (state.value === 'Resolved.Trailing') {
 *     console.log('Loaded data:', state.context.data);
 *   }
 * });
 *
 * fsm.send({ type: 'OPEN_ROOT', key: 'profile-card' });
 * fsm.send({ type: 'RESOLVE_SUCCESS', data: { username: 'alex' } });
 * ```
 */
export class PopoverCardFSM<
  TData = unknown,
  TPopoverKey extends string = string,
> implements PopoverFSMInterpreter<TData, TPopoverKey> {
  private state: PopoverFSMState<TData, TPopoverKey>;
  private readonly subscribers = new Set<FSMSubscriber<TData, TPopoverKey>>();
  private isDisposed = false;

  constructor(keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>) {
    this.state = createInitialFSMState(keyOrOptions);
  }

  /**
   * Returns the current state snapshot and context of the popover card.
   */
  public getState(): PopoverFSMState<TData, TPopoverKey> {
    return this.state;
  }

  /**
   * Returns the numeric bitmask flag corresponding to the current state.
   */
  public getStatusBit(): number {
    return STATE_VALUE_TO_BIT_MAP[this.state.value];
  }

  /**
   * Checks whether the current FSM state matches the specified state value.
   *
   * @param value - State value to test against (e.g. `'Resolved.Trailing'`).
   * @returns `true` if current state value matches.
   */
  public matches(value: PopoverStateValue): boolean {
    return this.state.value === value;
  }

  /**
   * Checks whether the popover is currently active (`Hydrating`, `Resolved.Trailing`, or `Resolved.Pinned`).
   *
   * @returns `true` if active in the UI.
   */
  public isActive(): boolean {
    return (this.getStatusBit() & FSMStatusBit.Active) !== 0;
  }

  /**
   * Checks whether the popover has resolved successfully and is ready to display content.
   *
   * @returns `true` if resolved.
   */
  public isResolved(): boolean {
    return isResolvedFSM(this.state);
  }

  /**
   * Dispatches a lifecycle event to trigger a state transition.
   *
   * If the proposed transition is admitted by the transition matrix, the new state is saved
   * and all subscribers are notified. If invalid, the event is ignored and current state returned.
   *
   * @param event - Lifecycle event (e.g. `OPEN_ROOT`, `RESOLVE_SUCCESS`, `TOGGLE_PIN`, `CLOSE`).
   * @returns The updated (or unchanged) state snapshot.
   *
   * @example
   * ```typescript
   * fsm.send({ type: 'CLOSE' });
   * ```
   */
  public send(event: PopoverFSMEvent<TData, TPopoverKey>): PopoverFSMState<TData, TPopoverKey> {
    if (this.isDisposed) return this.state;
    const nextState = transitionFSMState(this.state, event);
    if (nextState !== this.state) {
      this.state = nextState;
      this.notifySubscribers();
    }
    return this.state;
  }

  /**
   * Subscribes a listener callback to state transitions.
   *
   * @param listener - Callback invoked with the new state whenever a transition occurs.
   * @returns An unsubscribe cleanup function.
   *
   * @example
   * ```typescript
   * const unsubscribe = fsm.subscribe((state) => {
   *   console.log('New state:', state.value);
   * });
   * ```
   */
  public subscribe(listener: FSMSubscriber<TData, TPopoverKey>): () => void {
    this.subscribers.add(listener);
    return () => this.subscribers.delete(listener);
  }

  /**
   * Disposes the state machine and terminates all active subscriptions.
   */
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
 *
 * @template TData - Type of data payload associated with the popover.
 * @template TPopoverKey - String identifier type for the popover key.
 * @param keyOrOptions - Popover key string or configuration object.
 * @returns Initialized `PopoverCardFSM` instance.
 *
 * @example
 * ```typescript
 * const cardFsm = createPopoverFSM('user-settings');
 * cardFsm.send({ type: 'OPEN_ROOT', key: 'user-settings' });
 * ```
 */
export function createPopoverFSM<TData = unknown, TPopoverKey extends string = string>(
  keyOrOptions: TPopoverKey | PopoverFSMOptions<TData, TPopoverKey>,
): PopoverCardFSM<TData, TPopoverKey> {
  return new PopoverCardFSM(keyOrOptions);
}
