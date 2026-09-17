/**
 * Resolver Arity Caching and Safe Signature Invocation.
 * Supports both positional (key, parentData, context, signal) and object ({ key, parentData, context, signal }) signatures.
 *
 * @module store/resolver/resolverArity
 */

import type { ResolverParams } from '../../types';
import type { Maybe, MaybePromise } from '../../types/utilityTypes';
import { PopoverErrorCode, createPopoverError } from '../../utils/errors';
import type { AnyResolverFn } from './resolverTypes';

type ObjectResolver<TData, TContext> = (
  params: ResolverParams<TData, TContext>,
) => MaybePromise<TData>;

const arityCache = new WeakMap<object, 'positional' | 'object'>();

function assertResolverFunction(resolver: unknown): asserts resolver is Function {
  if (typeof resolver === 'function') return;
  throw createPopoverError(
    PopoverErrorCode.INVALID_TRANSITION,
    `invokeResolverSafely: resolver must be a function, received ${typeof resolver}.`,
    'Provide a valid resolver callback function to PopoverProvider or schema.',
  );
}

function isDestructuringMismatch(err: unknown): boolean {
  if (!(err instanceof TypeError)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('destructure') ||
    msg.includes('cannot read property') ||
    msg.includes('cannot read properties') ||
    msg.includes('expected object')
  );
}

function isObjectResolver<TData, TContext>(
  _resolver: AnyResolverFn<TData, TContext>,
  style: 'positional' | 'object',
): _resolver is ObjectResolver<TData, TContext> {
  return style === 'object';
}

function invokeByConvention<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: Maybe<TData>,
  context: TContext | undefined,
  signal: AbortSignal,
  style: 'positional' | 'object',
): MaybePromise<TData> {
  const cleanParentData = parentData ?? undefined;
  if (isObjectResolver(resolver, style)) {
    return resolver({ key, parentData: cleanParentData, context, signal });
  }
  return resolver(key, cleanParentData, context, signal);
}

/**
 * Safely invokes a resolver callback with automatic arity and signature convention detection.
 *
 * Supports both traditional positional parameter signatures `(key, parentData, context, signal)`
 * and modern object destructuring signatures `({ key, parentData, context, signal })`.
 * Dynamically detects the preferred calling convention on first run and caches it in a `WeakMap` for subsequent calls.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @param resolver - Resolver callback function to invoke.
 * @param key - Popover key identifier.
 * @param parentData - Optional data payload of the parent popover.
 * @param context - Ambient application or store context.
 * @param signal - AbortSignal for network or lifecycle cancellation.
 * @returns Resolved data or Promise of data.
 *
 * @example
 * ```typescript
 * const data = await invokeResolverSafely(
 *   resolver,
 *   'user-1',
 *   null,
 *   ctx,
 *   abortController.signal,
 * );
 * ```
 */
export function invokeResolverSafely<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: Maybe<TData>,
  context: TContext | undefined,
  signal: AbortSignal,
): MaybePromise<TData> {
  assertResolverFunction(resolver);

  const invoke = (s: 'positional' | 'object') =>
    invokeByConvention(resolver, key, parentData, context, signal, s);

  const cached = arityCache.get(resolver);
  if (cached) return invoke(cached);

  try {
    const data = invoke('positional');
    arityCache.set(resolver, 'positional');
    return data;
  } catch (err) {
    if (!isDestructuringMismatch(err)) throw err;
    const data = invoke('object');
    arityCache.set(resolver, 'object');
    return data;
  }
}
