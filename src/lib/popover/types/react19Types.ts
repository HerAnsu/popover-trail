/**
 * React 19 Server Actions, Transitions, and Optimistic UI Typing Contracts for popover-trail.
 * Provides compile-time safety for concurrent action dispatchers and optimistic reconciliation.
 *
 * @module types/react19Types
 */

/** Lifecycle status for React 19 Server Actions. */
export type PopoverActionStatus = 'idle' | 'pending' | 'success' | 'error';

/**
 * Discriminated state representation of a React 19 Server Action execution lifecycle.
 *
 * @template TData - Resolved payload data type.
 * @template TError - Action failure error type (defaults to Error).
 */
export type PopoverActionState<TData = unknown, TError = Error> =
  | {
      readonly status: 'idle';
      readonly data?: TData;
      readonly error?: undefined;
      readonly isOptimistic: false;
    }
  | {
      readonly status: 'pending';
      readonly data?: TData;
      readonly error?: undefined;
      readonly isOptimistic: boolean;
    }
  | {
      readonly status: 'success';
      readonly data: TData;
      readonly error?: undefined;
      readonly isOptimistic: false;
    }
  | {
      readonly status: 'error';
      readonly data?: TData;
      readonly error: TError;
      readonly isOptimistic: false;
    };

/**
 * React 19 Server Action signature compatible with form actions and custom transition handlers.
 *
 * @template TData - Returned data payload type.
 * @template TInput - Input argument type passed to action execution.
 */
export type PopoverServerAction<TData, TInput = void> = (
  prevState: PopoverActionState<TData>,
  input: TInput,
) => Promise<PopoverActionState<TData>> | PopoverActionState<TData>;

/**
 * Options for configuring the `usePopoverAction` hook.
 *
 * @template TData - Returned data payload type.
 * @template TInput - Input argument type passed to action execution.
 * @template TOptimistic - Optimistically computed data payload type.
 */
export interface UsePopoverActionOptions<TData, TInput = void, TOptimistic extends TData = TData> {
  /** The server action or async mutation function to execute. */
  readonly action: PopoverServerAction<TData, TInput>;
  /** Optional initial data to populate before action execution. */
  readonly initialData?: TData;
  /** Optional optimistic reducer computing immediate temporary state before server resolution. */
  readonly optimisticData?: (current: TData | undefined, input: TInput) => TOptimistic;
  /** Callback fired on successful server action completion. */
  readonly onSuccess?: (data: TData) => void;
  /** Callback fired when the action encounters an error. */
  readonly onError?: (error: unknown) => void;
}

/**
 * Return signature of the `usePopoverAction` hook.
 *
 * @template TData - Returned data payload type.
 * @template TInput - Input argument type passed to action execution.
 */
export interface UsePopoverActionResult<TData, TInput = void> {
  /** Active action state container. */
  readonly state: PopoverActionState<TData>;
  /** Whether the action is currently executing in an async transition. */
  readonly isPending: boolean;
  /** Whether the current data payload is optimistic and awaiting server confirmation. */
  readonly isOptimistic: boolean;
  /** Dispatches the server action with input arguments. */
  readonly execute: (input: TInput) => void;
  /** Resets action state back to idle. */
  readonly reset: () => void;
}
