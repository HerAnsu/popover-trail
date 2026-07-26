/**
 * Finite State Machine (FSM / Statechart) Engine for popover-trail.
 * Provides deterministic, zero-invalid-state transitions for popover card lifecycles.
 */

export type PopoverStateValue =
  | 'Idle'
  | 'Hydrating'
  | 'Resolved.Trailing'
  | 'Resolved.Pinned'
  | 'Error'
  | 'Unmounting';

export interface PopoverFSMContext<TData = unknown> {
  key: string;
  data?: TData;
  error?: Error;
  pinnedPos?: { top: number; left: number };
}

export type PopoverFSMEvent<TData = unknown> =
  | { type: 'OPEN_ROOT'; key: string }
  | { type: 'PUSH_NESTED'; key: string }
  | { type: 'RESOLVE_SUCCESS'; data: TData }
  | { type: 'RESOLVE_FAILURE'; error: Error }
  | { type: 'TOGGLE_PIN'; rect?: { top: number; left: number } }
  | { type: 'CLOSE' }
  | { type: 'RETRY' }
  | { type: 'TRANSITION_END' };

export interface PopoverFSMState<TData = unknown> {
  value: PopoverStateValue;
  context: PopoverFSMContext<TData>;
}

type TransitionFn<TData> = (
  context: PopoverFSMContext<TData>,
  event: PopoverFSMEvent<TData>,
) => PopoverFSMState<TData>;

type TransitionTable<TData> = {
  [K in PopoverStateValue]?: {
    [E in PopoverFSMEvent['type']]?: TransitionFn<TData>;
  };
};

/**
 * Pre-compiled $O(1)$ state transition lookup table.
 * Eliminates invalid state combinations by ignoring illegal event triggers.
 */
const FSM_TRANSITION_TABLE: TransitionTable<unknown> = {
  Idle: {
    OPEN_ROOT: (ctx, evt) => ({
      value: 'Hydrating',
      context: { ...ctx, key: (evt as { key: string }).key },
    }),
    PUSH_NESTED: (ctx, evt) => ({
      value: 'Hydrating',
      context: { ...ctx, key: (evt as { key: string }).key },
    }),
  },
  Hydrating: {
    RESOLVE_SUCCESS: (ctx, evt) => ({
      value: 'Resolved.Trailing',
      context: { ...ctx, data: (evt as { data: unknown }).data, error: undefined },
    }),
    RESOLVE_FAILURE: (ctx, evt) => ({
      value: 'Error',
      context: { ...ctx, error: (evt as { error: Error }).error },
    }),
    CLOSE: (ctx) => ({
      value: 'Unmounting',
      context: ctx,
    }),
  },
  'Resolved.Trailing': {
    TOGGLE_PIN: (ctx, evt) => ({
      value: 'Resolved.Pinned',
      context: { ...ctx, pinnedPos: (evt as { rect?: { top: number; left: number } }).rect },
    }),
    CLOSE: (ctx) => ({
      value: 'Unmounting',
      context: ctx,
    }),
  },
  'Resolved.Pinned': {
    TOGGLE_PIN: (ctx) => ({
      value: 'Resolved.Trailing',
      context: { ...ctx, pinnedPos: undefined },
    }),
    CLOSE: (ctx) => ({
      value: 'Unmounting',
      context: ctx,
    }),
  },
  Error: {
    RETRY: (ctx) => ({
      value: 'Hydrating',
      context: { ...ctx, error: undefined },
    }),
    CLOSE: (ctx) => ({
      value: 'Unmounting',
      context: ctx,
    }),
  },
  Unmounting: {
    TRANSITION_END: (ctx) => ({
      value: 'Idle',
      context: { key: ctx.key },
    }),
  },
};

/**
 * Pure state reducer for Popover FSM transitions.
 */
export function popoverFSMReducer<TData = unknown>(
  state: PopoverFSMState<TData>,
  event: PopoverFSMEvent<TData>,
): PopoverFSMState<TData> {
  const transitions = FSM_TRANSITION_TABLE[state.value];
  const transitionFn = transitions?.[event.type];

  if (!transitionFn) {
    // Guarantees zero-invalid-state invariant by returning original state on illegal transitions
    return state;
  }

  return transitionFn(state.context, event) as PopoverFSMState<TData>;
}

/**
 * Creates an instance of a Popover State Machine interpreter.
 */
export function createPopoverFSM<TData = unknown>(initialKey: string) {
  let currentState: PopoverFSMState<TData> = {
    value: 'Idle',
    context: { key: initialKey },
  };

  const listeners = new Set<(state: PopoverFSMState<TData>) => void>();

  return {
    getState: () => currentState,
    matches: (value: PopoverStateValue) => currentState.value === value,
    send: (event: PopoverFSMEvent<TData>) => {
      const nextState = (
        popoverFSMReducer as (
          s: PopoverFSMState<TData>,
          e: PopoverFSMEvent<TData>,
        ) => PopoverFSMState<TData>
      )(currentState, event);
      if (nextState !== currentState) {
        currentState = nextState;
        listeners.forEach((fn) => fn(currentState));
      }
      return currentState;
    },
    subscribe: (fn: (state: PopoverFSMState<TData>) => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
