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

export type TransitionFn<TData> = (
  context: PopoverFSMContext<TData>,
  event: PopoverFSMEvent<TData>,
) => PopoverFSMState<TData>;

export type TransitionTable<TData> = {
  [K in PopoverStateValue]?: {
    [E in PopoverFSMEvent['type']]?: TransitionFn<TData>;
  };
};

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
