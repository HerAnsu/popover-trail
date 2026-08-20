/**
 * Popover Trail Entry Entities and Discriminated State Subtypes for popover-trail.
 *
 * @module types/entryTypes
 */

import type { PopoverDisplayOptions } from './configTypes';

/**
 * Valid lifecycle transition status values for popover card mounting and unmounting animations.
 */
export type PopoverTransitionStatus = 'mounting' | 'mounted' | 'unmounting';

/**
 * Represents a single popover instance within the active trail stack or floating list.
 * Contains positioning coordinates, parent-child relations, and async data payload states.
 *
 * @template TData - Type of data payload resolved for this popover.
 * @template TPopoverKey - Union of valid popover string keys.
 *
 * @example
 * ```tsx
 * function CardView({ entry }: { entry: TrailEntry<UserData> }) {
 *   if (entry.status === 'success') {
 *     return <div>{entry.data.name}</div>;
 *   }
 *   if (entry.status === 'error') {
 *     return <div>Failed: {entry.error.message}</div>;
 *   }
 *   return <Spinner />;
 * }
 * ```
 */
export interface TrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends PopoverDisplayOptions {
  /** Unique key identifier for this popover card. */
  key: TPopoverKey;

  /** Parent popover key establishing the hierarchical cascade tree. */
  parentKey?: TPopoverKey;

  /** Trigger element bounding box used as anchor for positioning. */
  rect?: DOMRect;

  /** Custom coordinates `(top, left)` when the card is pinned / dragged. */
  pinnedLayoutPos?: {
    top: number;
    left: number;
  };

  /** Original parent key before pinning (restored on unpin). */
  originalParentKey?: TPopoverKey;

  /** Original trigger rect before pinning (restored on unpin). */
  originalRect?: DOMRect;

  /** Mount/unmount animation lifecycle state. */
  transitionStatus?: PopoverTransitionStatus;

  /** Current async data resolution status. */
  status?: 'loading' | 'error' | 'success';

  /** True while async data resolver is actively fetching. */
  isLoading?: boolean;

  /** Error instance if data resolution failed. */
  error?: Error | null;

  /** Resolved data payload when resolution succeeds. */
  data?: TData | null;

  /** Promise for React 19 `use(promise)` and Suspense boundaries. */
  dataPromise?: Promise<TData>;
}

/**
 * Narrowed `TrailEntry` in active loading state.
 * Guarantees `status: 'loading'`, `isLoading: true`, and `data: undefined`.
 */
export interface LoadingTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntry<TData, TPopoverKey> {
  status: 'loading';
  isLoading: true;
  data: undefined;
  error: null;
}

/**
 * Narrowed `TrailEntry` in failed resolution state.
 * Guarantees `status: 'error'`, `error: Error`, and `data: undefined`.
 */
export interface ErrorTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntry<TData, TPopoverKey> {
  status: 'error';
  isLoading: false;
  data: undefined;
  error: Error;
}

/**
 * Narrowed `TrailEntry` in successfully resolved state.
 * Guarantees `status: 'success'`, non-null `data: TData`, and `error: null`.
 */
export interface SuccessTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntry<TData, TPopoverKey> {
  status: 'success';
  isLoading: false;
  data: TData;
  error: null;
}

/**
 * Strict discriminated union of all active `TrailEntry` lifecycle states (`loading` | `error` | `success`).
 */
export type DiscriminatedTrailEntry<TData = unknown, TPopoverKey extends string = string> =
  | LoadingTrailEntry<TData, TPopoverKey>
  | ErrorTrailEntry<TData, TPopoverKey>
  | SuccessTrailEntry<TData, TPopoverKey>;

/**
 * Discriminated union representation of an entry's async resolution state.
 *
 * @template TData - Resolved data payload type.
 */
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };

/**
 * Type utility mapping a status discriminator string to its narrowed `TrailEntry` subtype.
 *
 * @template TData - Resolved data payload type.
 * @template TStatus - Target status (`'loading'` | `'error'` | `'success'`).
 * @template TPopoverKey - Popover key identifier union type.
 */
export type NarrowTrailEntry<
  TData,
  TStatus extends 'loading' | 'error' | 'success',
  TPopoverKey extends string = string,
> = TStatus extends 'loading'
  ? LoadingTrailEntry<TData, TPopoverKey>
  : TStatus extends 'error'
    ? ErrorTrailEntry<TData, TPopoverKey>
    : SuccessTrailEntry<TData, TPopoverKey>;

/**
 * Exhaustive pattern matcher utility for `TrailEntry` or `PopoverEntryDiscriminatedState`.
 *
 * @remarks
 * Guarantees that all three lifecycle states (`loading`, `error`, `success`) are handled at compile-time.
 * If a new variant is introduced, TypeScript will flag missing branches.
 *
 * @example
 * ```tsx
 * const content = matchEntryState(entry, {
 *   loading: () => <Spinner />,
 *   error: ({ error }) => <ErrorMessage error={error} />,
 *   success: ({ data }) => <ProfileView user={data} />,
 * });
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template R - Return value type from branch matchers.
 * @template TPopoverKey - Popover key identifier union type.
 * @param target - The active entry or discriminated state object.
 * @param matchers - Branch handlers for loading, error, and success states.
 * @returns Result value returned by the executed branch matcher.
 */
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey>,
  matchers: {
    loading: (entry: LoadingTrailEntry<TData, TPopoverKey>) => R;
    error: (entry: ErrorTrailEntry<TData, TPopoverKey>) => R;
    success: (entry: SuccessTrailEntry<TData, TPopoverKey>) => R;
  },
): R;
export function matchEntryState<TData, R>(
  target: PopoverEntryDiscriminatedState<TData>,
  matchers: {
    loading: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'loading' }>) => R;
    error: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'error' }>) => R;
    success: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'success' }>) => R;
  },
): R;
export function matchEntryState<TData, R, TPopoverKey extends string = string>(
  target: TrailEntry<TData, TPopoverKey> | PopoverEntryDiscriminatedState<TData>,
  matchers: {
    loading: (arg: never) => R;
    error: (arg: never) => R;
    success: (arg: never) => R;
  },
): R {
  const status =
    target.status ?? (target.isLoading ? 'loading' : target.error ? 'error' : 'success');
  switch (status) {
    case 'loading':
      return matchers.loading(target as never);
    case 'error':
      return matchers.error(target as never);
    case 'success':
      return matchers.success(target as never);
    default: {
      throw new Error(`Unhandled popover entry state: ${JSON.stringify(target)}`);
    }
  }
}
