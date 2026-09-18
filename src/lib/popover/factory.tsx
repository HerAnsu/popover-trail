/**
 * Unified Factory Engine for popover-trail.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module factory
 */

import React from 'react';
import { isDevEnv, validateFactoryPlacement } from './validators';
import { PopoverProvider as CorePopoverProvider } from './context/PopoverProvider';
import type { PopoverProviderProps } from './context/PopoverProviderProps';
import { usePopoverActions as coreUsePopoverActions } from './context/usePopoverStore';
import { PopoverTrigger as CorePopoverTrigger } from './components/PopoverTrigger';
import { PopoverPortal as CorePopoverPortal } from './components/PopoverPortal';
import {
  usePopover as coreUsePopover,
  usePopoverContext as coreUsePopoverContext,
  type UsePopoverResult,
} from './hooks/usePopoverSelectors';
import {
  createPopoverSchema,
  isPopoverSchemaInstance,
  isSchemaDefinition,
  type PopoverSchemaDefinition,
  type PopoverSchemaInstance,
} from './schema';
import { isRecordObject, isCurrentlyRenderingInReact } from './utils/typeGuards';
import type { RegisteredKeys, RegisteredDataMap } from './types/registerTypes';
import type { FactorySchemaSuite, FactoryGenericSuite } from './factoryTypes';

function resolveSchemaInstance(val: object): PopoverSchemaInstance<PopoverSchemaDefinition> | null {
  if (isPopoverSchemaInstance(val)) return val;
  if (isSchemaDefinition(val)) return createPopoverSchema(val);
  return null;
}

/**
 * Creates a strongly typed popover-trail suite pre-configured with a declarative schema.
 *
 * @template TSchema - Schema definition mapping keys to node configurations.
 * @param schema - Schema instance or declarative schema object defining nodes and child relationships.
 * @returns Pre-bound suite including `PopoverProvider`, `PopoverTrigger`, `PopoverPortal`, and hooks.
 *
 * @example
 * ```tsx
 * import { createPopoverTrail } from 'popover-trail';
 *
 * const { PopoverProvider, PopoverTrigger, PopoverPortal, usePopover } = createPopoverTrail({
 *   user: {
 *     resolve: async (id: string) => fetchUser(id),
 *     children: ['details', 'settings'],
 *   },
 *   details: {
 *     resolve: async (id: string) => fetchDetails(id),
 *   },
 * });
 * ```
 */
export function createPopoverTrail<TSchema extends PopoverSchemaDefinition>(
  schema: PopoverSchemaInstance<TSchema> | TSchema,
): FactorySchemaSuite<TSchema>;

/**
 * Creates a generic strongly typed popover-trail suite for custom data and ambient context types.
 *
 * @template TData - Popover resolved data payload type.
 * @template TContext - Ambient context type.
 * @returns Pre-bound suite including `PopoverProvider`, `PopoverTrigger`, `PopoverPortal`, and hooks.
 *
 * @example
 * ```tsx
 * import { createPopoverTrail } from 'popover-trail';
 *
 * interface UserData {
 *   id: string;
 *   name: string;
 * }
 *
 * const { PopoverProvider, PopoverTrigger, PopoverPortal, usePopover } =
 *   createPopoverTrail<UserData>();
 * ```
 */
export function createPopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
>(): FactoryGenericSuite<TData, TContext>;

/**
 * Root factory implementation for creating popover-trail suites.
 *
 * @param schema - Optional schema definition or instance.
 * @returns Bound suite containing components and hooks.
 */
export function createPopoverTrail(schema?: unknown): object {
  if (isDevEnv() && isCurrentlyRenderingInReact()) validateFactoryPlacement(true);

  const baseSuite = {
    PopoverProvider: (props: PopoverProviderProps<unknown, unknown>) =>
      React.createElement<PopoverProviderProps<unknown, unknown>>(CorePopoverProvider, props),
    PopoverTrigger: CorePopoverTrigger,
    PopoverPortal: CorePopoverPortal,
    usePopover: <K extends string = RegisteredKeys>(key: K): UsePopoverResult<unknown> =>
      coreUsePopover<K, unknown>(key),
    usePopoverActions: () => coreUsePopoverActions(),
    usePopoverContext: () => coreUsePopoverContext(),
  };

  if (isRecordObject(schema)) {
    const resolvedSchema = resolveSchemaInstance(schema);
    if (resolvedSchema) {
      return {
        ...resolvedSchema,
        ...baseSuite,
        PopoverProvider: (props: PopoverProviderProps<unknown, unknown>) =>
          React.createElement<PopoverProviderProps<unknown, unknown>>(CorePopoverProvider, {
            schema: resolvedSchema,
            ...props,
          }),
      };
    }
  }

  return baseSuite;
}
