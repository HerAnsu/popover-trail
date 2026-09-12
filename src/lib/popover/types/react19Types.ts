/**
 * React 19 Server Actions, Transitions, and Optimistic UI Typing Contracts for popover-trail.
 * Provides compile-time safety for concurrent action dispatchers and optimistic reconciliation.
 *
 * @module types/react19Types
 */

export const POPOVER_ACTION_STATUSES = ['idle', 'pending', 'success', 'error'] as const;

/** Lifecycle status for React 19 Server Actions. */
export type PopoverActionStatus = (typeof POPOVER_ACTION_STATUSES)[number];

/**
 * Discriminated state representation of a React 19 Server Action execution lifecycle.
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
 */
export type PopoverServerAction<TData, TInput = void> = (
  prevState: PopoverActionState<TData>,
  input: TInput,
) => Promise<PopoverActionState<TData>> | PopoverActionState<TData>;

/**
 * Options for configuring the `usePopoverAction` hook.
 */
export interface UsePopoverActionOptions<TData, TInput = void, TOptimistic extends TData = TData> {
  readonly action: PopoverServerAction<TData, TInput>;
  readonly initialData?: TData;
  readonly optimisticData?: (current: TData | undefined, input: TInput) => TOptimistic;
  readonly onSuccess?: (data: TData) => void;
  readonly onError?: (error: unknown) => void;
}

/**
 * Return signature of the `usePopoverAction` hook.
 */
export interface UsePopoverActionResult<TData, TInput = void> {
  readonly state: PopoverActionState<TData>;
  readonly isPending: boolean;
  readonly isOptimistic: boolean;
  readonly execute: (input: TInput) => void;
  readonly reset: () => void;
}
