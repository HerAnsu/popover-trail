/**
 * Unified Factory Engine for popover-trail.
 * Provides `createPopoverTrail` for schema-based or generic type-safe bindings.
 *
 * @module factory
 */

import React from 'react';
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
  type PopoverSchemaDefinition,
  type PopoverSchemaInstance,
} from './schema';
import { validateFactoryPlacement } from './validators';
import { wrapResult, isOk } from './utils/result';
import type { RegisteredKeys, RegisteredDataMap } from './types/registerTypes';

declare const process: { env: { NODE_ENV?: string } } | undefined;

declare module 'react' {
  interface ReactSharedInternals {
    ReactCurrentDispatcher?: { current?: unknown };
    ReactCurrentOwner?: { current?: unknown };
    ReactCurrentBatchConfig?: { current?: unknown };
  }

  export const __CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals | undefined;
  export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED: ReactSharedInternals | undefined;
}

/**
 * Inspects React dispatcher internals in development mode to detect if `createPopoverTrail`
 * was accidentally invoked inside a component's render body instead of at the module top level.
 * Creating factory instances on every render causes store recreation and loss of state.
 */
function isCurrentlyRenderingInReact(): boolean {
  const checkResult = wrapResult(() => {
    const secret =
      React.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED ??
      React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    return Boolean(
      secret?.ReactCurrentDispatcher?.current ||
      secret?.ReactCurrentOwner?.current ||
      secret?.ReactCurrentBatchConfig?.current,
    );
  });
  return isOk(checkResult) ? checkResult.data : false;
}

/**
 * Creates pre-typed, scoped Popover components and hooks bound to a schema definition.
 *
 * @remarks
 * In schema mode, all popover keys, child node constraints, and data payload types
 * are inferred at compile-time directly from the provided schema.
 *
 * @example
 * ```tsx
 * export const trail = createPopoverTrail({
 *   user: {
 *     resolver: async (id: string) => fetchUser(id),
 *     placement: 'right',
 *   },
 * });
 *
 * // Render the scoped provider
 * function App() {
 *   return (
 *     <trail.PopoverProvider>
 *       <trail.PopoverTrigger popoverKey="user">
 *         <button type="button">Open User</button>
 *       </trail.PopoverTrigger>
 *     </trail.PopoverProvider>
 *   );
 * }
 * ```
 *
 * @template TSchema - Schema definition mapping keys to data payloads.
 * @param schema - Schema instance or definition object.
 * @returns Strongly typed suite of Popover components, triggers, and hooks.
 */
export function createPopoverTrail<TSchema extends PopoverSchemaDefinition>(
  schema: PopoverSchemaInstance<TSchema> | TSchema,
): PopoverSchemaInstance<TSchema> & {
  PopoverProvider: React.ComponentType<PopoverProviderProps<unknown, unknown>>;
  PopoverTrigger: typeof CorePopoverTrigger;
  PopoverPortal: typeof CorePopoverPortal;
  usePopover: typeof coreUsePopover;
  usePopoverActions: typeof coreUsePopoverActions;
  usePopoverContext: typeof coreUsePopoverContext;
};

/**
 * Creates generic scoped Popover components and hooks without a predefined schema.
 *
 * @remarks
 * Use this overload when popover keys and data payloads are dynamic or defined through
 * global interface augmentation via `PopoverRegistry`.
 *
 * @example
 * ```tsx
 * export const trail = createPopoverTrail<UserPayload, AppContext>();
 *
 * function App() {
 *   return (
 *     <trail.PopoverProvider resolveData={async (key) => fetchDynamicData(key)}>
 *       <trail.PopoverTrigger popoverKey="dynamicCard">
 *         <button type="button">Open</button>
 *       </trail.PopoverTrigger>
 *     </trail.PopoverProvider>
 *   );
 * }
 * ```
 *
 * @template TData - Default data payload type for popovers.
 * @template TContext - Global shared context object type.
 * @returns Scoped Popover components and hooks.
 */
export function createPopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
>(): {
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  PopoverTrigger: typeof CorePopoverTrigger;
  PopoverPortal: typeof CorePopoverPortal;
  usePopover: <K extends string = RegisteredKeys>(key: K) => UsePopoverResult<TData>;
  usePopoverActions: () => ReturnType<typeof coreUsePopoverActions<TData, TContext>>;
  usePopoverContext: () => TContext;
};

/**
 * Core implementation of `createPopoverTrail`.
 * Validates module placement in development mode and returns the bound suite.
 */
export function createPopoverTrail(schema?: unknown): object {
  if (
    process !== undefined &&
    process?.env?.NODE_ENV !== 'production' &&
    isCurrentlyRenderingInReact()
  ) {
    validateFactoryPlacement(true);
  }

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

  if (schema && typeof schema === 'object') {
    const isInstance = 'createResolver' in schema;
    const resolvedSchema = isInstance
      ? schema
      : createPopoverSchema(schema as PopoverSchemaDefinition);

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

  return baseSuite;
}
