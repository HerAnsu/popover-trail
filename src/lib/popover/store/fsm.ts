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

/** Valid transition matrix mapping state to allowed next states. */
export type ValidStateTransitions = Readonly<
  Record<PopoverStateValue, ReadonlyArray<PopoverStateValue>>
>;

/** Bitmask flags for high-performance O(1) state status checking. */
export const FSMStatusBit = {
  Idle: 1,
  Hydrating: 1 << 1,
  ResolvedTrailing: 1 << 2,
  ResolvedPinned: 1 << 3,
  Error: 1 << 4,
  Unmounting: 1 << 5,
  Active: (1 << 1) | (1 << 2) | (1 << 3),
} as const;

export type FSMStatusBit = (typeof FSMStatusBit)[keyof typeof FSMStatusBit];

/** Mapping of string state names to high-performance bitmask values. */
export const STATE_VALUE_TO_BIT_MAP: Record<PopoverStateValue, number> = {
  Idle: FSMStatusBit.Idle,
  Hydrating: FSMStatusBit.Hydrating,
  'Resolved.Trailing': FSMStatusBit.ResolvedTrailing | FSMStatusBit.Active,
  'Resolved.Pinned': FSMStatusBit.ResolvedPinned | FSMStatusBit.Active,
  Error: FSMStatusBit.Error,
  Unmounting: FSMStatusBit.Unmounting,
};

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

/** FSM State in Idle initial state. */
export interface IdleFSMState<TData = unknown> {
  value: 'Idle';
  context: PopoverFSMContext<TData>;
}

/** FSM State in Hydrating data resolution state. */
export interface HydratingFSMState<TData = unknown> {
  value: 'Hydrating';
  context: PopoverFSMContext<TData>;
}

/** FSM State in Resolved.Trailing state holding data payload. */
export interface ResolvedTrailingFSMState<TData = unknown> {
  value: 'Resolved.Trailing';
  context: PopoverFSMContext<TData> & { data: TData };
}

/** FSM State in Resolved.Pinned state holding data payload and pinned position coordinates. */
export interface ResolvedPinnedFSMState<TData = unknown> {
  value: 'Resolved.Pinned';
  context: PopoverFSMContext<TData> & { data: TData; pinnedPos?: { top: number; left: number } };
}

/** FSM State in Error state holding resolution failure error. */
export interface ErrorFSMState<TData = unknown> {
  value: 'Error';
  context: PopoverFSMContext<TData> & { error: Error };
}

/** FSM State in Unmounting teardown state. */
export interface UnmountingFSMState<TData = unknown> {
  value: 'Unmounting';
  context: PopoverFSMContext<TData>;
}

/**
 * Immutable snapshot of the state machine status and context.
 * Represented as a discriminated union over state value.
 *
 * @template TData - The resolved data payload type.
 */
export type PopoverFSMState<TData = unknown> =
  | IdleFSMState<TData>
  | HydratingFSMState<TData>
  | ResolvedTrailingFSMState<TData>
  | ResolvedPinnedFSMState<TData>
  | ErrorFSMState<TData>
  | UnmountingFSMState<TData>;

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

function handleIdleTransition<TData>(
  state: IdleFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'OPEN_ROOT' || event.type === 'PUSH_NESTED') {
    return { value: 'Hydrating', context: { ...state.context, key: event.key } };
  }
  return state;
}

function handleHydratingTransition<TData>(
  state: HydratingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'RESOLVE_SUCCESS') {
    return {
      value: 'Resolved.Trailing',
      context: { ...state.context, data: event.data, error: undefined },
    };
  }
  if (event.type === 'RESOLVE_FAILURE') {
    return { value: 'Error', context: { ...state.context, error: event.error } };
  }
  if (event.type === 'CLOSE') {
    return { value: 'Unmounting', context: state.context };
  }
  return state;
}

function handleTrailingTransition<TData>(
  state: ResolvedTrailingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'TOGGLE_PIN') {
    return {
      value: 'Resolved.Pinned',
      context: {
        key: state.context.key,
        data: state.context.data,
        error: state.context.error,
        pinnedPos: event.rect,
      },
    };
  }
  if (event.type === 'CLOSE') {
    return { value: 'Unmounting', context: state.context };
  }
  return state;
}

function handlePinnedTransition<TData>(
  state: ResolvedPinnedFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'TOGGLE_PIN') {
    return {
      value: 'Resolved.Trailing',
      context: {
        key: state.context.key,
        data: state.context.data,
        error: state.context.error,
        pinnedPos: undefined,
      },
    };
  }
  if (event.type === 'CLOSE') {
    return { value: 'Unmounting', context: state.context };
  }
  return state;
}

function handleErrorTransition<TData>(
  state: ErrorFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'RETRY') {
    return { value: 'Hydrating', context: { ...state.context, error: undefined } };
  }
  if (event.type === 'CLOSE') {
    return { value: 'Unmounting', context: state.context };
  }
  return state;
}

function handleUnmountingTransition<TData>(
  state: UnmountingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'TRANSITION_END') {
    return { value: 'Idle', context: { key: state.context.key } };
  }
  if (event.type === 'OPEN_ROOT' || event.type === 'PUSH_NESTED') {
    return {
      value: 'Hydrating',
      context:
        state.context.key === event.key ? state.context : { ...state.context, key: event.key },
    };
  }
  return state;
}

/**
 * Pure reducer computing the next FSM state given current state and event.
 * Natively narrows discriminated unions without any type assertions.
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
  switch (state.value) {
    case 'Idle':
      return handleIdleTransition(state, event);
    case 'Hydrating':
      return handleHydratingTransition(state, event);
    case 'Resolved.Trailing':
      return handleTrailingTransition(state, event);
    case 'Resolved.Pinned':
      return handlePinnedTransition(state, event);
    case 'Error':
      return handleErrorTransition(state, event);
    case 'Unmounting':
      return handleUnmountingTransition(state, event);

    default: {
      const _exhaustiveCheck: never = state;
      return _exhaustiveCheck;
    }
  }
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
 * fsm.send({ type: 'RESOLVE_SUCCESS', data: { title: 'Card 1' } });
 * console.log(fsm.getState().value); // 'Resolved.Trailing'
 * ```
 *
 * @see {@link popoverFSMReducer}
 * @see {@link assertPopoverFSMState}
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
        listeners.forEach((fn) => {
          try {
            fn(currentState);
          } catch (err) {
            console.error('[popover-trail FSM]: Error in subscriber callback:', err);
          }
        });
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
 *
 * @example
 * ```typescript
 * assertPopoverFSMState(fsmState, 'Resolved.Trailing');
 * // fsmState.context.data is now safely accessible
 * ```
 *
 * @see {@link createPopoverFSM}
 * @see {@link popoverFSMReducer}
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

/**
 * Validates whether a transitionStatus transition is valid according to FSM transition rules.
 */
export function isValidTransitionStatusChange(
  current: import('../types').PopoverTransitionStatus | undefined,
  next: import('../types').PopoverTransitionStatus,
): boolean {
  if (!current || current === next) return true;
  if (current === 'unmounting') return next === 'mounting';
  if (current === 'mounting') return next === 'mounted' || next === 'unmounting';
  if (current === 'mounted') return next === 'unmounting';
  return false;
}
