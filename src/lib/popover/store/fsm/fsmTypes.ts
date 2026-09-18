/**
 * FSM Types and Interfaces for popover-trail.
 *
 * @module store/fsm/fsmTypes
 */

export type PopoverStateValue =
  | 'Idle'
  | 'Hydrating'
  | 'Resolved.Trailing'
  | 'Resolved.Pinned'
  | 'Error'
  | 'Unmounting';

export interface PopoverFSMContext<TData = unknown, TPopoverKey extends string = string> {
  key: TPopoverKey;
  data?: TData;
  error?: Error;
  pinnedPos?: { top: number; left: number };
}

export type PopoverFSMEvent<TData = unknown, TPopoverKey extends string = string> =
  | { type: 'OPEN_ROOT'; key: TPopoverKey }
  | { type: 'PUSH_NESTED'; key: TPopoverKey }
  | { type: 'RESOLVE_SUCCESS'; data: TData }
  | { type: 'RESOLVE_FAILURE'; error: Error }
  | { type: 'TOGGLE_PIN'; rect?: { top: number; left: number } }
  | { type: 'CLOSE' }
  | { type: 'RETRY' }
  | { type: 'TRANSITION_END' };

export interface IdleFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Idle';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export interface HydratingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Hydrating';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export interface ResolvedTrailingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Resolved.Trailing';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export interface ResolvedPinnedFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Resolved.Pinned';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export interface ErrorFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Error';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export interface UnmountingFSMState<TData = unknown, TPopoverKey extends string = string> {
  readonly value: 'Unmounting';
  readonly context: Readonly<PopoverFSMContext<TData, TPopoverKey>>;
}

export type PopoverFSMState<TData = unknown, TPopoverKey extends string = string> =
  | IdleFSMState<TData, TPopoverKey>
  | HydratingFSMState<TData, TPopoverKey>
  | ResolvedTrailingFSMState<TData, TPopoverKey>
  | ResolvedPinnedFSMState<TData, TPopoverKey>
  | ErrorFSMState<TData, TPopoverKey>
  | UnmountingFSMState<TData, TPopoverKey>;

export type FSMSubscriber<TData = unknown, TPopoverKey extends string = string> = (
  state: PopoverFSMState<TData, TPopoverKey>,
) => void;

export interface PopoverFSMInterpreter<TData = unknown, TPopoverKey extends string = string> {
  getState(): PopoverFSMState<TData, TPopoverKey>;
  getStatusBit(): number;
  matches(value: PopoverStateValue): boolean;
  isActive(): boolean;
  isResolved(): boolean;
  send(event: PopoverFSMEvent<TData, TPopoverKey>): PopoverFSMState<TData, TPopoverKey>;
  subscribe(listener: FSMSubscriber<TData, TPopoverKey>): () => void;
  dispose(): void;
  [Symbol.dispose](): void;
}

export interface FSMRegistryOptions<TData = unknown, TPopoverKey extends string = string> {
  readonly onIllegalTransition?: (
    key: TPopoverKey,
    from: PopoverStateValue,
    event: PopoverFSMEvent<TData, TPopoverKey>,
  ) => void;
  readonly isDev?: boolean;
}

export type { ValidNextFSMState } from './fsmMatrix';
