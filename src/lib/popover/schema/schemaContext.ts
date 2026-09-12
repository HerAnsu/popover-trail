/**
 * Schema Context Inference and Resolution Utilities.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaContext
 */

import type { InferSchemaContext } from './schemaTypes';

export type { InferSchemaContext };

/**
 * Resolves schema context with a default fallback if undefined.
 *
 * @param context - Optional runtime context value.
 * @param defaultContext - Fallback context value.
 * @returns Resolved non-undefined context.
 */
export function resolveSchemaContext<TContext>(
  context: TContext | undefined,
  defaultContext: TContext,
): TContext {
  return context !== undefined ? context : defaultContext;
}

/**
 * Type guard checking whether a schema context is defined and non-null.
 *
 * @param context - Candidate context value.
 * @returns True if context is defined and not null.
 */
export function hasSchemaContext<TContext>(
  context: TContext | undefined | null,
): context is TContext {
  return context !== undefined && context !== null;
}

/**
 * Creates a context resolver function with an initial default fallback.
 *
 * @param defaultContext - Default context supplied when runtime context is omitted.
 * @returns Resolver function taking optional context.
 */
export function createDefaultContextResolver<TContext>(
  defaultContext: TContext,
): (context?: TContext) => TContext {
  return (context?: TContext): TContext =>
    context !== undefined ? context : defaultContext;
}
