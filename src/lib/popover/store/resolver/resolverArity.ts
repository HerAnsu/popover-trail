/**
 * Resolver Arity Caching and Safe Signature Invocation.
 * Supports both positional (key, parentData, context, signal) and object ({ key, parentData, context, signal }) signatures.
 *
 * @module store/resolver/resolverArity
 */

import type { ResolverParams } from '../../types';
import { PopoverErrorCode, createPopoverError } from '../../utils/errors';
import type { AnyResolverFn } from './resolverTypes';

type ObjectResolver<TData, TContext> = (
  params: ResolverParams<TData, TContext>,
) => Promise<TData> | TData;

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
  parentData: TData | null | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
  style: 'positional' | 'object',
): TData | Promise<TData> {
  const cleanParentData = parentData ?? undefined;
  if (isObjectResolver(resolver, style)) {
    return resolver({ key, parentData: cleanParentData, context, signal });
  }
  return resolver(key, cleanParentData, context, signal);
}

/**
 * Safely invokes a resolver function with automatic positional/object arity detection and caching.
 */
export function invokeResolverSafely<TData, TContext>(
  resolver: AnyResolverFn<TData, TContext>,
  key: string,
  parentData: TData | null | undefined,
  context: TContext | undefined,
  signal: AbortSignal,
): TData | Promise<TData> {
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
