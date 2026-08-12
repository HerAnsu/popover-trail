/**
 * Unified Factory Engine for popover-trail.
 * Provides `createPopoverTrail` for schema-based or generic type-safe bindings.
 *
 * @module factory
 */

import React from 'react';
import {
  PopoverProvider as CorePopoverProvider,
  PopoverPortal as CorePopoverPortal,
  usePopover as coreUsePopover,
  usePopoverActions as coreUsePopoverActions,
  usePopoverContext as coreUsePopoverContext,
  PopoverTrigger as CorePopoverTrigger,
  type UsePopoverResult,
} from './index';
import type { PopoverProviderProps } from './context';
import type { PopoverTriggerProps } from './components/PopoverTrigger';
import {
  createPopoverSchema,
  type PopoverSchemaDefinition,
  type PopoverSchemaInstance,
} from './schema';
import { validateFactoryPlacement } from './utils/devWarnings';
import type { RegisteredKeys, RegisteredDataMap } from './types/registerTypes';
interface ReactInternals {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: { current?: unknown };
    ReactCurrentOwner?: { current?: unknown };
    ReactCurrentBatchConfig?: { transition?: unknown };
  };
}

/**
 * Safely inspects React internals to detect if a call is executed inside a component render pass.
 */
function isCurrentlyRenderingInReact(): boolean {
  try {
    const secret = (React as ReactInternals).__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    return Boolean(
      secret?.ReactCurrentDispatcher?.current ||
      secret?.ReactCurrentOwner?.current ||
      secret?.ReactCurrentBatchConfig?.transition,
    );
  } catch {
    return false;
  }
}

function DefaultPopoverProvider(props: PopoverProviderProps<unknown, unknown>) {
  return <CorePopoverProvider {...props} />;
}
DefaultPopoverProvider.displayName = 'PopoverProvider';

function DefaultPopoverTrigger(props: PopoverTriggerProps<string>) {
  return <CorePopoverTrigger {...props} />;
}
DefaultPopoverTrigger.displayName = 'PopoverTrigger';

const DEFAULT_GENERIC_TRAIL_INSTANCE = Object.freeze({
  PopoverProvider: DefaultPopoverProvider,
  PopoverPortal: CorePopoverPortal,
  PopoverTrigger: DefaultPopoverTrigger,
  usePopover: coreUsePopover as (key: string) => UsePopoverResult<unknown>,
  usePopoverActions: coreUsePopoverActions as () => ReturnType<typeof coreUsePopoverActions>,
  usePopoverContext: coreUsePopoverContext as () => unknown,
});

/**
 * Unified factory creating popover trail instances from a schema definition.
 *
 * @template TSchema - Schema definition map type.
 * @param definition - Object map defining schema nodes.
 * @returns Strongly typed schema instance with bound triggers, hooks, and keys.
 */
export function createPopoverTrail<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): PopoverSchemaInstance<TSchema>;

/**
 * Unified factory creating generic type-bound popover trail components and hooks.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Shared context payload type.
 * @template TPopoverKey - Union of valid popover keys.
 * @returns Object containing type-bound PopoverProvider, PopoverTrigger, PopoverPortal, and hooks.
 *
 * @example
 * ```tsx
 * import { createPopoverTrail } from 'popover-trail';
 *
 * const myTrail = createPopoverTrail<MyData, MyContext, 'card-1' | 'card-2'>();
 * ```
 *
 * @see {@link createPopoverSchema}
 * @see {@link PopoverProvider}
 */
export function createPopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
>(): {
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  PopoverPortal: typeof CorePopoverPortal;
  PopoverTrigger: React.ComponentType<PopoverTriggerProps<TPopoverKey>>;
  usePopover: (key: TPopoverKey) => UsePopoverResult<TData>;
  usePopoverActions: () => ReturnType<typeof coreUsePopoverActions<TData, TContext, TPopoverKey>>;
  usePopoverContext: () => TContext;
};

export function createPopoverTrail(definition?: PopoverSchemaDefinition): unknown {
  validateFactoryPlacement(isCurrentlyRenderingInReact());

  if (definition && typeof definition === 'object') {
    return createPopoverSchema(definition);
  }

  return DEFAULT_GENERIC_TRAIL_INSTANCE;
}
