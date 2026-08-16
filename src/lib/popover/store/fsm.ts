/**
 * Finite State Machine (FSM / Statechart) Engine for popover-trail.
 * Provides deterministic, zero-invalid-state transitions for popover card lifecycles.
 *
 * Lifecycle flow:
 * - A popover starts in the Idle state.
 * - Opening a root card or pushing a nested card transitions it to Hydrating while data loads.
 * - Once resolved, the card enters Resolved.Trailing (stacked in cascade) or Resolved.Pinned (floating window).
 * - Toggling pin switches the card between Resolved.Trailing and Resolved.Pinned.
 * - If data loading fails, the card enters Error state with retry support.
 * - Closing transitions the card to Unmounting to run exit animations before returning to Idle.
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

/**
 * Bitmask flags for high-performance O(1) state status checking without string comparisons.
 * Used internally for ultra-fast filtering across large active popover stacks.
 */
export const FSMStatusBit = {
  /** Unmounted / inactive state */
  Idle: 1,
  /** Data resolution promise in flight */
  Hydrating: 1 << 1,
  /** Data resolved, currently stacked in trailing breadcrumb cascade */
  ResolvedTrailing: 1 << 2,
  /** Data resolved, currently detached as a floating modeless canvas card */
  ResolvedPinned: 1 << 3,
  /** Data resolution failed with an Error object */
  Error: 1 << 4,
  /** Exit animation in progress before removal from store */
  Unmounting: 1 << 5,
  /** Composite mask for any active state that renders UI (Hydrating | Resolved.Trailing | Resolved.Pinned) */
  Active: (1 << 1) | (1 << 2) | (1 << 3),
} as const;

export type FSMStatusBit = (typeof FSMStatusBit)[keyof typeof FSMStatusBit];

/** Mapping of string state names to high-performance bitmask values. */
export const STATE_VALUE_TO_BIT_MAP: Readonly<Record<PopoverStateValue, number>> = Object.freeze({
  Idle: FSMStatusBit.Idle,
  Hydrating: FSMStatusBit.Hydrating,
  'Resolved.Trailing': FSMStatusBit.ResolvedTrailing | FSMStatusBit.Active,
  'Resolved.Pinned': FSMStatusBit.ResolvedPinned | FSMStatusBit.Active,
  Error: FSMStatusBit.Error,
  Unmounting: FSMStatusBit.Unmounting,
});

/**
 * Context payload held within an FSM state node.
 * Contains the active data, error, and pinning coordinates associated with the state.
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
  readonly value: 'Idle';
  readonly context: Readonly<PopoverFSMContext<TData>>;
}

/** FSM State in Hydrating data resolution state. */
export interface HydratingFSMState<TData = unknown> {
  readonly value: 'Hydrating';
  readonly context: Readonly<PopoverFSMContext<TData>>;
}

/** FSM State in Resolved.Trailing state holding data payload. */
export interface ResolvedTrailingFSMState<TData = unknown> {
  readonly value: 'Resolved.Trailing';
  readonly context: Readonly<PopoverFSMContext<TData>> & { readonly data: TData };
}

/** FSM State in Resolved.Pinned state holding data payload and pinned position coordinates. */
export interface ResolvedPinnedFSMState<TData = unknown> {
  readonly value: 'Resolved.Pinned';
  readonly context: Readonly<PopoverFSMContext<TData>> & {
    readonly data: TData;
    readonly pinnedPos?: { readonly top: number; readonly left: number };
  };
}

/** FSM State in Error state holding resolution failure error. */
export interface ErrorFSMState<TData = unknown> {
  readonly value: 'Error';
  readonly context: Readonly<PopoverFSMContext<TData>> & { readonly error: Error };
}

/** FSM State in Unmounting teardown state. */
export interface UnmountingFSMState<TData = unknown> {
  readonly value: 'Unmounting';
  readonly context: Readonly<PopoverFSMContext<TData>>;
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

/** Configuration options for initializing a Popover FSM instance. */
export interface PopoverFSMOptions<TData = unknown> {
  /** Unique popover key identifier. */
  key: string;
  /** Optional initial state override (defaults to 'Idle'). */
  initialState?: PopoverStateValue;
  /** Initial resolved data payload if pre-hydrated. */
  initialData?: TData;
  /** Initial Error object if pre-errored. */
  initialError?: Error;
  /** Initial pinned screen coordinates. */
  initialPinnedPos?: { top: number; left: number };
}

/** Accepted parameter types for createPopoverFSM (string key or full options object). */
export type PopoverFSMInitialParam<TData = unknown> = string | PopoverFSMOptions<TData>;

const DISPOSE_SYMBOL: symbol =
  (Symbol as { dispose?: symbol }).dispose ?? Symbol.for('Symbol.dispose');

function handleIdleTransition<TData>(
  state: IdleFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (event.type === 'OPEN_ROOT' || event.type === 'PUSH_NESTED') {
    return {
      value: 'Hydrating',
      context: {
        key: event.key,
        data: undefined,
        error: undefined,
        pinnedPos: undefined,
      },
    };
  }
  return state;
}

function handleHydratingTransition<TData>(
  state: HydratingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  switch (event.type) {
    case 'RESOLVE_SUCCESS':
      return {
        value: 'Resolved.Trailing',
        context: {
          key: state.context.key,
          data: event.data,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    case 'RESOLVE_FAILURE':
      return {
        value: 'Error',
        context: {
          key: state.context.key,
          data: undefined,
          error: event.error,
          pinnedPos: undefined,
        },
      };
    case 'CLOSE':
      return {
        value: 'Unmounting',
        context: state.context,
      };
    case 'OPEN_ROOT':
    case 'PUSH_NESTED':
      return {
        value: 'Hydrating',
        context: {
          ...state.context,
          key: event.key,
        },
      };
    default:
      return state;
  }
}

function handleTrailingTransition<TData>(
  state: ResolvedTrailingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  switch (event.type) {
    case 'TOGGLE_PIN':
      return {
        value: 'Resolved.Pinned',
        context: {
          key: state.context.key,
          data: state.context.data,
          error: undefined,
          pinnedPos: event.rect,
        },
      };
    case 'CLOSE':
      return {
        value: 'Unmounting',
        context: state.context,
      };
    case 'OPEN_ROOT':
    case 'PUSH_NESTED':
      return {
        value: 'Hydrating',
        context: {
          key: event.key,
          data: undefined,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    default:
      return state;
  }
}

function handlePinnedTransition<TData>(
  state: ResolvedPinnedFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  switch (event.type) {
    case 'TOGGLE_PIN':
      return {
        value: 'Resolved.Trailing',
        context: {
          key: state.context.key,
          data: state.context.data,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    case 'CLOSE':
      return {
        value: 'Unmounting',
        context: state.context,
      };
    default:
      return state;
  }
}

function handleErrorTransition<TData>(
  state: ErrorFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  switch (event.type) {
    case 'RETRY':
      return {
        value: 'Hydrating',
        context: {
          key: state.context.key,
          data: undefined,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    case 'CLOSE':
      return {
        value: 'Unmounting',
        context: state.context,
      };
    case 'OPEN_ROOT':
    case 'PUSH_NESTED':
      return {
        value: 'Hydrating',
        context: {
          key: event.key,
          data: undefined,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    default:
      return state;
  }
}

function handleUnmountingTransition<TData>(
  state: UnmountingFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  switch (event.type) {
    case 'TRANSITION_END':
      return {
        value: 'Idle',
        context: {
          key: state.context.key,
          data: undefined,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    case 'OPEN_ROOT':
    case 'PUSH_NESTED':
      return {
        value: 'Hydrating',
        context: {
          key: event.key,
          data: undefined,
          error: undefined,
          pinnedPos: undefined,
        },
      };
    default:
      return state;
  }
}

/**
 * Pure state machine reducer computing the next immutable FSM state given the current state and event.
 *
 * @template TData - Resolved data payload type.
 * @param state - Active immutable state snapshot.
 * @param event - State transition event object.
 * @returns Next state node (or current reference if transition is invalid).
 */
export function popoverFSMReducer<TData = unknown>(
  state: PopoverFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  if (!event?.type) {
    return state;
  }

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

function buildInitialFSMState<TData>(
  initialParam: PopoverFSMInitialParam<TData>,
): PopoverFSMState<TData> {
  const options: PopoverFSMOptions<TData> =
    typeof initialParam === 'string' ? { key: initialParam } : initialParam;

  const key = options.key || 'default';
  const initialState = options.initialState || 'Idle';

  switch (initialState) {
    case 'Hydrating':
      return { value: 'Hydrating', context: { key } };
    case 'Resolved.Trailing':
      return {
        value: 'Resolved.Trailing',
        context: { key, data: options.initialData as TData },
      };
    case 'Resolved.Pinned':
      return {
        value: 'Resolved.Pinned',
        context: {
          key,
          data: options.initialData as TData,
          pinnedPos: options.initialPinnedPos,
        },
      };
    case 'Error':
      return {
        value: 'Error',
        context: { key, error: options.initialError ?? new Error('Unknown FSM error') },
      };
    case 'Unmounting':
      return { value: 'Unmounting', context: { key } };
    case 'Idle':
    default:
      return { value: 'Idle', context: { key } };
  }
}

/**
 * Creates an instance of a Popover State Machine interpreter.
 *
 * @template TData - The resolved data payload type.
 * @param initialParam - String popover key or full initialization options object.
 * @returns State machine interpreter instance with getState, send, matches, and subscribe methods.
 *
 * @example
 * ```typescript
 * // String form
 * const fsm1 = createPopoverFSM('user-1');
 *
 * // Object form (matches docs/API.md)
 * const fsm2 = createPopoverFSM({ key: 'userProfile' });
 *
 * fsm2.send({ type: 'OPEN_ROOT', key: 'userProfile' });
 * fsm2.send({ type: 'RESOLVE_SUCCESS', data: { id: '1', name: 'Alice' } });
 * ```
 */
export function createPopoverFSM<TData = unknown>(initialParam: PopoverFSMInitialParam<TData>) {
  let currentState: PopoverFSMState<TData> = buildInitialFSMState(initialParam);
  const listeners = new Set<(state: PopoverFSMState<TData>) => void>();

  const getState = (): PopoverFSMState<TData> => currentState;

  const matches = (value: PopoverStateValue): boolean => currentState.value === value;

  const isActive = (): boolean =>
    (STATE_VALUE_TO_BIT_MAP[currentState.value] & FSMStatusBit.Active) !== 0;

  const isResolved = (): boolean =>
    currentState.value === 'Resolved.Trailing' || currentState.value === 'Resolved.Pinned';

  const getStatusBit = (): number => STATE_VALUE_TO_BIT_MAP[currentState.value];

  const send = (event: PopoverFSMEvent<TData>): PopoverFSMState<TData> => {
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
  };

  const subscribe = (fn: (state: PopoverFSMState<TData>) => void): (() => void) => {
    listeners.add(fn);
    return () => {
      listeners.delete(fn);
    };
  };

  const dispose = (): void => {
    listeners.clear();
  };

  return {
    getState,
    matches,
    isActive,
    isResolved,
    getStatusBit,
    send,
    subscribe,
    dispose,
    [DISPOSE_SYMBOL]: dispose,
  };
}

export type PopoverFSMInterpreter<TData = unknown> = ReturnType<typeof createPopoverFSM<TData>>;

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
): asserts state is PopoverFSMState<TData> & { readonly value: S } {
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
