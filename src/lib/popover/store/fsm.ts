/**
 * Finite State Machine (FSM / Statechart) Engine for popover-trail.
 * Provides deterministic, zero-invalid-state transitions for popover card lifecycles.
 *
 * @module fsm
 */

/** Possible discrete state values for a popover card state machine. */
export type PopoverStateValue =
  | 'Idle'
  | 'Hydrating'
  | 'Resolved.Trailing'
  | 'Resolved.Pinned'
  | 'Error'
  | 'Unmounting';

/**
 * Context payload held within an FSM state node.
 *
 * @template TData - The resolved data payload type.
 */
export interface PopoverFSMContext<TData = unknown> {
  /** Unique popover key identifier. */
  key: string;
  /** Resolved data payload when in Resolved state. */
  data?: TData;
  /** Error object if resolution failed. */
  error?: Error;
  /** Absolute coordinates if card is pinned. */
  pinnedPos?: { top: number; left: number };
}

/**
 * Events dispatched to trigger state machine transitions.
 *
 * @template TData - The resolved data payload type.
 */
export type PopoverFSMEvent<TData = unknown> =
  | { type: 'OPEN_ROOT'; key: string }
  | { type: 'PUSH_NESTED'; key: string }
  | { type: 'RESOLVE_SUCCESS'; data: TData }
  | { type: 'RESOLVE_FAILURE'; error: Error }
  | { type: 'TOGGLE_PIN'; rect?: { top: number; left: number } }
  | { type: 'CLOSE' }
  | { type: 'RETRY' }
  | { type: 'TRANSITION_END' };

/**
 * Immutable snapshot of the state machine status and context.
 *
 * @template TData - The resolved data payload type.
 */
export interface PopoverFSMState<TData = unknown> {
  value: PopoverStateValue;
  context: PopoverFSMContext<TData>;
}

/** Transition function type mapping context and event to next state. */
export type TransitionFn<TData> = (
  context: PopoverFSMContext<TData>,
  event: PopoverFSMEvent<TData>,
) => PopoverFSMState<TData>;

/** Declarative transition table mapping state values and events to transition functions. */
export type TransitionTable<TData> = {
  [K in PopoverStateValue]?: {
    [E in PopoverFSMEvent['type']]?: TransitionFn<TData>;
  };
};

/**
 * Pure reducer computing the next FSM state given current state and event.
 *
 * @template TData - The resolved data payload type.
 * @param state - Current FSM state node.
 * @param event - Dispatched event.
 * @returns The next state node (or current state reference if unhandled).
 */
export function popoverFSMReducer<TData = unknown>(
  state: PopoverFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  const { value, context } = state;

  switch (value) {
    case 'Idle':
      if (event.type === 'OPEN_ROOT' || event.type === 'PUSH_NESTED') {
        return {
          value: 'Hydrating',
          context: { ...context, key: event.key },
        };
      }
      break;

    case 'Hydrating':
      if (event.type === 'RESOLVE_SUCCESS') {
        return {
          value: 'Resolved.Trailing',
          context: { ...context, data: event.data, error: undefined },
        };
      }
      if (event.type === 'RESOLVE_FAILURE') {
        return {
          value: 'Error',
          context: { ...context, error: event.error },
        };
      }
      if (event.type === 'CLOSE') {
        return {
          value: 'Unmounting',
          context,
        };
      }
      break;

    case 'Resolved.Trailing':
      if (event.type === 'TOGGLE_PIN') {
        return {
          value: 'Resolved.Pinned',
          context: { ...context, pinnedPos: event.rect },
        };
      }
      if (event.type === 'CLOSE') {
        return {
          value: 'Unmounting',
          context,
        };
      }
      break;

    case 'Resolved.Pinned':
      if (event.type === 'TOGGLE_PIN') {
        return {
          value: 'Resolved.Trailing',
          context: { ...context, pinnedPos: undefined },
        };
      }
      if (event.type === 'CLOSE') {
        return {
          value: 'Unmounting',
          context,
        };
      }
      break;

    case 'Error':
      if (event.type === 'RETRY') {
        return {
          value: 'Hydrating',
          context: { ...context, error: undefined },
        };
      }
      if (event.type === 'CLOSE') {
        return {
          value: 'Unmounting',
          context,
        };
      }
      break;

    case 'Unmounting':
      if (event.type === 'TRANSITION_END') {
        return {
          value: 'Idle',
          context: { key: context.key },
        };
      }
      if (event.type === 'OPEN_ROOT' || event.type === 'PUSH_NESTED') {
        return {
          value: 'Hydrating',
          context: { ...context, key: event.key },
        };
      }
      break;
  }

  return state;
}

/**
 * Creates an instance of a Popover State Machine interpreter.
 *
 * @template TData - The resolved data payload type.
 * @param initialKey - Initial popover key.
 * @returns State machine interpreter instance with getState, send, matches, and subscribe methods.
 *
 * @example
 * ```typescript
 * const fsm = createPopoverFSM('card-1');
 * fsm.send({ type: 'OPEN_ROOT', key: 'card-1' });
 * console.log(fsm.getState().value); // 'Hydrating'
 * ```
 */
export function createPopoverFSM<TData = unknown>(initialKey: string) {
  let currentState: PopoverFSMState<TData> = {
    value: 'Idle',
    context: { key: initialKey },
  };

  const listeners = new Set<(state: PopoverFSMState<TData>) => void>();

  return {
    /** Returns current immutable state node. */
    getState: (): PopoverFSMState<TData> => currentState,

    /** Checks whether active state value matches the expected state. */
    matches: (value: PopoverStateValue): boolean => currentState.value === value,

    /**
     * Dispatches an event to transition state.
     *
     * @param event - Event to process.
     * @returns Updated state node.
     */
    send: (event: PopoverFSMEvent<TData>): PopoverFSMState<TData> => {
      const nextState = popoverFSMReducer(currentState, event);
      if (nextState !== currentState) {
        currentState = nextState;
        listeners.forEach((fn) => fn(currentState));
      }
      return currentState;
    },

    /**
     * Subscribes a listener callback to state changes.
     *
     * @param fn - Listener callback.
     * @returns Unsubscribe function.
     */
    subscribe: (fn: (state: PopoverFSMState<TData>) => void): (() => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}

/**
 * TypeScript assertion function verifying the active FSM state value.
 * Throws an Error if FSM state does not match expected state.
 *
 * @template TData - The resolved data payload type.
 * @template S - Expected state value string literal.
 * @param state - State object to check.
 * @param expectedState - Target expected state value.
 * @throws {Error} If state.value !== expectedState.
 */
export function assertPopoverFSMState<
  TData = unknown,
  S extends PopoverStateValue = PopoverStateValue,
>(
  state: PopoverFSMState<TData>,
  expectedState: S,
): asserts state is PopoverFSMState<TData> & { value: S } {
  if (state.value !== expectedState) {
    throw new Error(
      `[popover-trail FSM assertion error]: Expected FSM state "${expectedState}", but received state "${state.value}".`,
    );
  }
}
