/**
 * Finite State Machine (FSM / Statechart) Engine for popover-trail.
 * Provides deterministic, zero-invalid-state transitions for popover card lifecycles.
 *
 * @module fsm
 */

import { wrapResult, isErr } from '../utils/result';
import { DISPOSE_SYMBOL } from '../utils/disposable';
import { PopoverErrorCode, createPopoverError } from '../utils/errors';

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
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface PopoverFSMContext<TData = unknown, TPopoverKey extends string = string> {
  /** Unique popover key identifier. */
  key: TPopoverKey;
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
 * @template TPopoverKey - Union of valid popover string keys.
 */
export type PopoverFSMEvent<TData = unknown, TPopoverKey extends string = string> =
  | { type: 'OPEN_ROOT'; key: TPopoverKey }
  | { type: 'PUSH_NESTED'; key: TPopoverKey }
  | { type: 'RESOLVE_SUCCESS'; data: TData }
  | { type: 'RESOLVE_FAILURE'; error: Error }
  | { type: 'TOGGLE_PIN'; rect?: { top: number; left: number } }
  | { type: 'CLOSE' }
  | { type: 'RETRY' }
  | { type: 'TRANSITION_END' };

/** FSM State in Idle initial state. */
export interface IdleFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Idle';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

/** FSM State in Hydrating data resolution state. */
export interface HydratingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Hydrating';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

/** FSM State in Resolved.Trailing state holding data payload. */
export interface ResolvedTrailingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Resolved.Trailing';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>> & { readonly data: TData };
}

/** FSM State in Resolved.Pinned state holding data payload and pinned position coordinates. */
export interface ResolvedPinnedFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Resolved.Pinned';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>> & {
    readonly data: TData;
    readonly pinnedPos?: { readonly top: number; readonly left: number };
  };
}

/** FSM State in Error state holding resolution failure error. */
export interface ErrorFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Error';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>> & { readonly error: Error };
}

/** FSM State in Unmounting teardown state. */
export interface UnmountingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Unmounting';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

/**
 * Immutable snapshot of the state machine status and context.
 * Represented as a discriminated union over state value.
 */
export type PopoverFSMState<TData = unknown, TPopoverKey extends string = string> =
  | IdleFSMState<TData, TPopoverKey>
  | HydratingFSMState<TData, TPopoverKey>
  | ResolvedTrailingFSMState<TData, TPopoverKey>
  | ResolvedPinnedFSMState<TData, TPopoverKey>
  | ErrorFSMState<TData, TPopoverKey>
  | UnmountingFSMState<TData, TPopoverKey>;

/** Configuration options for initializing a Popover FSM instance. */
export interface PopoverFSMOptions<TData = unknown, TPopoverKey extends string = string> {
  /** Unique popover key identifier. */
  key: TPopoverKey;
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
export type PopoverFSMInitialParam<TData = unknown, TPopoverKey extends string = string> =
  | TPopoverKey
  | PopoverFSMOptions<TData, TPopoverKey>;

function handleIdleTransition<TData, TPopoverKey extends string>(
  state: IdleFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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

function handleHydratingTransition<TData, TPopoverKey extends string>(
  state: HydratingFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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
          ...state.context,
          key: event.key,
        },
      };
    default:
      return state;
  }
}

function handleTrailingTransition<TData, TPopoverKey extends string>(
  state: ResolvedTrailingFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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

function handlePinnedTransition<TData, TPopoverKey extends string>(
  state: ResolvedPinnedFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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
    case 'RETRY':
      return {
        value: 'Hydrating',
        context: {
          key: state.context.key,
          data: undefined,
          error: undefined,
          pinnedPos: state.context.pinnedPos,
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

function handleErrorTransition<TData, TPopoverKey extends string>(
  state: ErrorFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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

function handleUnmountingTransition<TData, TPopoverKey extends string>(
  state: UnmountingFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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
 */
export function popoverFSMReducer<TData = unknown, TPopoverKey extends string = string>(
  state: PopoverFSMState<TData, TPopoverKey>,
  event: PopoverFSMEvent<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
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
      return state;
    }
  }
}

function buildInitialFSMState<TData, TPopoverKey extends string>(
  initialParam: PopoverFSMInitialParam<TData, TPopoverKey>,
): PopoverFSMState<TData, TPopoverKey> {
  const options: PopoverFSMOptions<TData, TPopoverKey> =
    typeof initialParam === 'string' ? { key: initialParam } : initialParam;

  const key = options.key;
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
    default:
      return { value: 'Idle', context: { key } };
  }
}

/**
 * Creates an instance of a Popover State Machine interpreter.
 * Guarantees zero invalid intermediate states during data resolution and unmounting.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover key string type.
 * @param initialParam - Popover key or configuration options object.
 * @returns FSM interpreter with `getState`, `send`, `matches`, `isActive`, and `subscribe`.
 *
 * @example
 * ```typescript
 * const fsm = createPopoverFSM({ key: 'user' });
 * fsm.send({ type: 'OPEN_ROOT', key: 'user' });
 * console.log(fsm.matches('Hydrating')); // true
 * fsm.send({ type: 'RESOLVE_SUCCESS', data: { name: 'Alice' } });
 * console.log(fsm.matches('Resolved.Trailing')); // true
 * ```
 */
export function createPopoverFSM<TData = unknown, TPopoverKey extends string = string>(
  initialParam: PopoverFSMInitialParam<TData, TPopoverKey>,
) {
  let currentState: PopoverFSMState<TData, TPopoverKey> = buildInitialFSMState<TData, TPopoverKey>(
    initialParam,
  );
  const listeners = new Set<(state: PopoverFSMState<TData, TPopoverKey>) => void>();

  const getState = (): PopoverFSMState<TData, TPopoverKey> => currentState;

  const matches = (value: PopoverStateValue): boolean => currentState.value === value;

  const isActive = (): boolean =>
    (STATE_VALUE_TO_BIT_MAP[currentState.value] & FSMStatusBit.Active) !== 0;

  const isResolved = (): boolean =>
    currentState.value === 'Resolved.Trailing' || currentState.value === 'Resolved.Pinned';

  const getStatusBit = (): number => STATE_VALUE_TO_BIT_MAP[currentState.value];

  const send = (
    event: PopoverFSMEvent<TData, TPopoverKey>,
  ): PopoverFSMState<TData, TPopoverKey> => {
    const nextState = popoverFSMReducer<TData, TPopoverKey>(currentState, event);
    if (nextState !== currentState) {
      currentState = nextState;
      listeners.forEach((fn) => {
        const notifyResult = wrapResult(() => fn(currentState));
        if (isErr(notifyResult)) {
          console.error('[popover-trail FSM]: Error in subscriber callback:', notifyResult.error);
        }
      });
    }
    return currentState;
  };

  const subscribe = (fn: (state: PopoverFSMState<TData, TPopoverKey>) => void): (() => void) => {
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

export type PopoverFSMInterpreter<
  TData = unknown,
  TPopoverKey extends string = string,
> = ReturnType<typeof createPopoverFSM<TData, TPopoverKey>>;

export type ExtractFSMState<
  S extends PopoverStateValue,
  TData = unknown,
  TPopoverKey extends string = string,
> = Extract<PopoverFSMState<TData, TPopoverKey>, { readonly value: S }>;

/**
 * TypeScript assertion function verifying the active FSM state value with exact context narrowing.
 *
 * @template TData - Resolved data payload type.
 * @template S - Expected FSM state value.
 * @template TPopoverKey - Popover string key type.
 * @param state - FSM state candidate.
 * @param expectedState - Required state discriminator string.
 * @throws {Error} If current state value does not match `expectedState`.
 */
export function assertPopoverFSMState<
  TData = unknown,
  S extends PopoverStateValue = PopoverStateValue,
  TPopoverKey extends string = string,
>(
  state: PopoverFSMState<TData, TPopoverKey>,
  expectedState: S,
): asserts state is ExtractFSMState<S, TData, TPopoverKey> {
  if (state.value !== expectedState) {
    throw createPopoverError(
      PopoverErrorCode.INVALID_TRANSITION,
      `Expected FSM state "${expectedState}", but received state "${state.value}".`,
      `Verify FSM transition logic before asserting state "${expectedState}".`,
    );
  }
}

/**
 * Validates whether a transitionStatus transition is valid according to FSM transition rules.
 *
 * @param current - Current transition status.
 * @param next - Proposed next transition status.
 * @returns `true` if transition is allowed.
 */
export function isValidTransitionStatusChange(
  current: import('../types').PopoverTransitionStatus | undefined,
  next: import('../types').PopoverTransitionStatus,
): boolean {
  if (!current || current === next) return true;
  if (current === 'unmounting') return next === 'mounting';
  if (current === 'mounting') return next === 'mounted' || next === 'unmounting';
  if (current === 'mounted') return next === 'unmounting' || next === 'mounting';
  return false;
}
