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
 *
 * @template TData - The type of resolved data payload associated with this popover.
 */
export interface TrailEntry<TData = unknown> extends PopoverDisplayOptions {
  /**
   * Unique identifier for this popover instance.
   * Typically derived from the expression, name, or key of the resolved entity.
   */
  key: string;

  /**
   * Parent popover identifier.
   * Establishes the parent-child linkage tree when popovers are nested.
   */
  parentKey?: string;

  /**
   * Bounding box of the element (e.g. trigger button) that anchored/spawned this popover.
   * Used as the anchor target by Floating UI for relative positioning.
   */
  rect?: DOMRect;

  /**
   * Custom viewport-relative absolute coordinates when the popover is pinned/floating.
   */
  pinnedLayoutPos?: {
    top: number;
    left: number;
  };

  /**
   * Stores the original parent key before the popover was pinned.
   * Used to restore the trail tree linkage when unpinning the card.
   */
  originalParentKey?: string;

  /**
   * Stores the original trigger bounding box before the popover was pinned.
   * Used to restore relative trigger geometry when unpinning the card.
   */
  originalRect?: DOMRect;

  /** Transition lifecycle state for animating mount/exit states. */
  transitionStatus?: PopoverTransitionStatus;

  /** Discriminated status lifecycle indicator. */
  status?: 'loading' | 'error' | 'success';

  /** True if data resolution is currently in progress. */
  isLoading?: boolean;

  /** Error instance if data resolution failed. */
  error?: Error | null;

  /** Resolved data payload. */
  data?: TData | null;

  /** Resolution promise for Suspense and React 19 use(). */
  dataPromise?: Promise<TData>;
}

/** TrailEntry subtype in loading state. */
export interface LoadingTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'loading';
  isLoading: true;
  data: undefined;
  error: null;
}

/** TrailEntry subtype in error state. */
export interface ErrorTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'error';
  isLoading: false;
  data: undefined;
  error: Error;
}

/** TrailEntry subtype in successfully resolved state. */
export interface SuccessTrailEntry<TData = unknown> extends TrailEntry<TData> {
  status: 'success';
  isLoading: false;
  data: TData;
  error: null;
}

/**
 * Discriminated union representation of a TrailEntry's asynchronous resolution state.
 *
 * @template TData - The resolved data payload type.
 */
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };

/** Type helper mapping a status string discriminator to its narrowed TrailEntry subtype. */
export type NarrowTrailEntry<
  TData,
  TStatus extends 'loading' | 'error' | 'success',
> = TStatus extends 'loading'
  ? LoadingTrailEntry<TData>
  : TStatus extends 'error'
    ? ErrorTrailEntry<TData>
    : SuccessTrailEntry<TData>;

/**
 * Exhaustive pattern matcher utility for `PopoverEntryDiscriminatedState`.
 *
 * @remarks
 * Guarantees that all three lifecycle states (`loading`, `error`, `success`) are handled at compile-time.
 * If a new variant is introduced, TypeScript will flag missing branches.
 *
 * @example
 * ```tsx
 * const content = matchEntryState(entryState, {
 *   loading: () => <Spinner />,
 *   error: ({ error }) => <ErrorMessage error={error} />,
 *   success: ({ data }) => <ProfileView user={data} />,
 * });
 * ```
 *
 * @template TData - Resolved data payload type.
 * @template R - Return value type from branch matchers.
 * @param state - The active discriminated state object.
 * @param matchers - Branch handlers for loading, error, and success states.
 * @returns Result value returned by the executed branch matcher.
 */
export function matchEntryState<TData, R>(
  state: PopoverEntryDiscriminatedState<TData>,
  matchers: {
    loading: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'loading' }>) => R;
    error: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'error' }>) => R;
    success: (state: Extract<PopoverEntryDiscriminatedState<TData>, { status: 'success' }>) => R;
  },
): R {
  switch (state.status) {
    case 'loading':
      return matchers.loading(state);
    case 'error':
      return matchers.error(state);
    case 'success':
      return matchers.success(state);
    default: {
      const _exhaustiveCheck: never = state;
      throw new Error(`Unhandled popover entry state: ${JSON.stringify(_exhaustiveCheck)}`);
    }
  }
}
