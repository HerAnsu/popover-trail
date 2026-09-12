/**
 * Discriminated State Variants and TrailEntry Definitions for popover-trail.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/entry/entryVariants
 */

import type { TrailEntryBase } from './entryBase';

export interface IdleTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntryBase<TPopoverKey, TData> {
  status?: 'idle';
  isLoading?: false;
  data?: undefined;
  error?: null;
  readonly _phantomData?: (data: TData) => void;
}

export interface LoadingTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntryBase<TPopoverKey, TData> {
  status: 'loading';
  isLoading: true;
  data?: undefined;
  error: null;
  readonly _phantomData?: (data: TData) => void;
}

export interface ErrorTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntryBase<TPopoverKey, TData> {
  status: 'error';
  isLoading: false;
  data?: undefined;
  error: Error;
  readonly _phantomData?: (data: TData) => void;
}

export interface SuccessTrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntryBase<TPopoverKey, TData> {
  status: 'success';
  isLoading: false;
  data: TData;
  error: null;
}

export const TRAIL_ENTRY_STATUSES = ['idle', 'loading', 'error', 'success'] as const;

export type TrailEntryStatus = (typeof TRAIL_ENTRY_STATUSES)[number];

export interface TrailEntry<
  TData = unknown,
  TPopoverKey extends string = string,
> extends TrailEntryBase<TPopoverKey, TData> {
  status?: TrailEntryStatus;
  isLoading?: boolean;
  error?: Error | null;
  data?: TData | null;
}

/**
 * Discriminated algebraic union of all active trail entry variant types.
 *
 * @remarks
 * Models popover card lifecycles as a strict disjoint union:
 * - Idle: Registered or pre-mounted card before data resolution.
 * - Loading: Data resolution in-flight, isLoading is true, error is null.
 * - Error: Resolution failed, error contains the thrown exception, data is undefined.
 * - Success: Resolution succeeded, data is guaranteed to be non-null TData.
 */
export type DiscriminatedTrailEntry<TData = unknown, TPopoverKey extends string = string> =
  | IdleTrailEntry<TData, TPopoverKey>
  | LoadingTrailEntry<TData, TPopoverKey>
  | ErrorTrailEntry<TData, TPopoverKey>
  | SuccessTrailEntry<TData, TPopoverKey>;

/**
 * Pure discriminated state tuple representation for popover entries.
 * Decouples state analysis from the full DOM-bound TrailEntry structure.
 *
 * @remarks
 * Guarantees compile-time exhaustiveness in pattern matchers:
 * ```typescript
 * if (state.status === 'success') {
 *   // TypeScript guarantees state.data is TData!
 *   console.log(state.data);
 * }
 * ```
 */
export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { readonly status: 'idle'; readonly isLoading: false; readonly data: undefined; readonly error: null }
  | { readonly status: 'loading'; readonly isLoading: true; readonly data: undefined; readonly error: null }
  | { readonly status: 'error'; readonly isLoading: false; readonly data: undefined; readonly error: Error }
  | { readonly status: 'success'; readonly isLoading: false; readonly data: TData; readonly error: null };

export type NarrowTrailEntry<
  TData,
  TStatus extends 'idle' | 'loading' | 'error' | 'success',
  TPopoverKey extends string = string,
> = TStatus extends 'idle'
  ? IdleTrailEntry<TData, TPopoverKey>
  : TStatus extends 'loading'
    ? LoadingTrailEntry<TData, TPopoverKey>
    : TStatus extends 'error'
      ? ErrorTrailEntry<TData, TPopoverKey>
      : SuccessTrailEntry<TData, TPopoverKey>;
