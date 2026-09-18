/**
 * Parameter Parsing and Option Merging for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaParams
 */

import type { OpenRootOptions, OpenNestedOptions } from '../types';
import { extractDisplayOptions } from '../utils/displayOptions';
import type { PopoverSchemaNode } from './schemaTypes';

/**
 * Structured parameter payload optionally passed as the first argument to resolver invocation.
 *
 * @template TC - Ambient context type.
 */
export interface ParsedKeyParams<TC = unknown> {
  /** Popover key string identifier. */
  key?: string;
  /** Parent popover data payload. */
  parentData?: unknown;
  /** Ambient context. */
  context?: TC;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
}

/**
 * Type guard validating if an unknown value is a structured `ParsedKeyParams` record.
 *
 * @template TC - Ambient context type.
 * @param val - Candidate value to test.
 * @returns True if `val` is a non-null object.
 */
export function isParsedKeyParams<TC>(val: unknown): val is ParsedKeyParams<TC> {
  return typeof val === 'object' && val !== null;
}

/**
 * Normalizes either a string key or structured parameter object into standardized resolver arguments.
 *
 * @template TC - Ambient context type.
 * @param rawKey - String key or structured params object.
 * @param parentData - Optional parent popover data.
 * @param context - Optional ambient context.
 * @param signal - Optional AbortSignal.
 * @returns Normalized parameters record containing `key`, `parentData`, `context`, and `signal`.
 *
 * @example
 * ```typescript
 * const params = parseResolverInvocationParams('user', parentUser, ctx, signal);
 * console.log(params.key); // 'user'
 * ```
 */
export function parseResolverInvocationParams<TC>(
  rawKey: string | object,
  parentData?: unknown,
  context?: TC,
  signal?: AbortSignal,
): { key: string; parentData: unknown; context: TC | undefined; signal: AbortSignal | undefined } {
  if (isParsedKeyParams<TC>(rawKey)) {
    const { key: rKey, parentData: rData, context: rContext, signal: rSignal } = rawKey;
    return {
      key: String(rKey ?? ''),
      parentData: rData ?? parentData,
      context: rContext ?? context,
      signal: rSignal ?? signal,
    };
  }
  return {
    key: String(rawKey),
    parentData,
    context,
    signal,
  };
}

/**
 * Merges schema node default display options (placement, offset, collision) with user-provided action options.
 * User-provided options take precedence over node defaults.
 *
 * @param node - Optional schema node configuration.
 * @param options - Optional runtime open options.
 * @returns Combined options object, or undefined if neither was supplied.
 *
 * @example
 * ```typescript
 * const merged = mergeSchemaNodeOptions(userNode, { offset: 12 });
 * ```
 */
export function mergeSchemaNodeOptions(
  node?: PopoverSchemaNode,
  options?: OpenRootOptions | OpenNestedOptions,
): (OpenRootOptions & OpenNestedOptions) | undefined {
  if (!node) return options;
  return {
    ...extractDisplayOptions(node),
    ...options,
  };
}
