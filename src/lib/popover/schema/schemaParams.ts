/**
 * Parameter Parsing and Option Merging for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaParams
 */

import type { OpenRootOptions, OpenNestedOptions } from '../types';
import { extractDisplayOptions } from '../utils/displayOptions';
import type { PopoverSchemaNode } from './schemaTypes';

export interface ParsedKeyParams<TC = unknown> {
  key?: string;
  parentData?: unknown;
  context?: TC;
  signal?: AbortSignal;
}

export function isParsedKeyParams<TC>(val: unknown): val is ParsedKeyParams<TC> {
  return typeof val === 'object' && val !== null;
}

export function parseResolverInvocationParams<TC>(
  rawKey: string | object,
  parentData?: unknown,
  context?: TC,
  signal?: AbortSignal,
): { key: string; parentData: unknown; context: TC | undefined; signal: AbortSignal | undefined } {
  if (isParsedKeyParams<TC>(rawKey)) {
    return {
      key: String(rawKey.key ?? ''),
      parentData: rawKey.parentData ?? parentData,
      context: rawKey.context ?? context,
      signal: rawKey.signal ?? signal,
    };
  }
  return {
    key: String(rawKey),
    parentData,
    context,
    signal,
  };
}

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
