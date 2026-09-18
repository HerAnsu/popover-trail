/**
 * Middleware Types for Resolver Pipeline.
 *
 * @module store/resolver/pipelineMiddlewareTypes
 */

export interface ResolverParams<TContext = unknown, TPopoverKey extends string = string> {
  readonly key: TPopoverKey;
  readonly parentData?: unknown;
  readonly context?: TContext;
  readonly signal: AbortSignal;
}

export type ResolverHandler<TData, TContext = unknown, TPopoverKey extends string = string> = (
  params: ResolverParams<TContext, TPopoverKey>,
) => Promise<TData>;

export type ResolverMiddleware<TData, TContext = unknown, TPopoverKey extends string = string> = (
  next: ResolverHandler<TData, TContext, TPopoverKey>,
) => ResolverHandler<TData, TContext, TPopoverKey>;
