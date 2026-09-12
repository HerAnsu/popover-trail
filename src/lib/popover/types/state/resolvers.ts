/**
 * Resolver Signature Contracts and Cache Interfaces for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/state/resolvers
 */

import type { MaybePromise } from '../utilityTypes';

export interface ResolverParams<TParentData = unknown, TContext = unknown> {
  readonly key: string;
  readonly parentData?: TParentData;
  readonly context?: TContext;
  readonly signal: AbortSignal;
}

export type PopoverResolver<TData = unknown, TContext = unknown, TParentData = TData> = (
  keyOrName: string,
  parentData?: TParentData,
  context?: TContext,
  signal?: AbortSignal,
) => MaybePromise<TData>;

export type InferResolverData<T> =
  T extends PopoverResolver<infer D, unknown, unknown> ? D : unknown;

export type CancellablePopoverResolver<
  TData = unknown,
  TParentData = unknown,
  TContext = unknown,
> = (params: ResolverParams<TParentData, TContext>) => MaybePromise<TData>;

export interface PopoverCache<TData = unknown> {
  readonly get: (key: string) => MaybePromise<TData> | undefined;
  readonly set: (key: string, value: TData, ttlMs?: number) => void;
  readonly has: (key: string) => boolean;
  readonly delete: (key: string) => boolean | void;
  readonly clear: () => void;
  readonly destroy?: () => void;
}

