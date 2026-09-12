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

export type DiscriminatedTrailEntry<TData = unknown, TPopoverKey extends string = string> =
  | IdleTrailEntry<TData, TPopoverKey>
  | LoadingTrailEntry<TData, TPopoverKey>
  | ErrorTrailEntry<TData, TPopoverKey>
  | SuccessTrailEntry<TData, TPopoverKey>;

export type PopoverEntryDiscriminatedState<TData = unknown> =
  | { status: 'loading'; isLoading: true; data: undefined; error: null }
  | { status: 'error'; isLoading: false; data: undefined; error: Error }
  | { status: 'success'; isLoading: false; data: TData; error: null };

export type NarrowTrailEntry<
  TData,
  TStatus extends 'loading' | 'error' | 'success',
  TPopoverKey extends string = string,
> = TStatus extends 'loading'
  ? LoadingTrailEntry<TData, TPopoverKey>
  : TStatus extends 'error'
    ? ErrorTrailEntry<TData, TPopoverKey>
    : SuccessTrailEntry<TData, TPopoverKey>;
