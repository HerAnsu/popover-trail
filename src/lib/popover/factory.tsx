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

interface ReactInternals {
  __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED?: {
    ReactCurrentDispatcher?: { current?: unknown };
  };
}

/**
 * Safely inspects React internals to detect if a call is executed inside a component render pass.
 */
function isCurrentlyRenderingInReact(): boolean {
  try {
    const secret = (React as unknown as ReactInternals)
      .__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
    return Boolean(secret?.ReactCurrentDispatcher?.current);
  } catch {
    return false;
  }
}

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
 */
export function createPopoverTrail<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(): {
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  PopoverPortal: typeof CorePopoverPortal;
  PopoverTrigger: React.ComponentType<PopoverTriggerProps<TPopoverKey>>;
  usePopover: (key: TPopoverKey) => UsePopoverResult<TData>;
  usePopoverActions: () => ReturnType<typeof coreUsePopoverActions<TData, TContext>>;
  usePopoverContext: () => TContext;
};

export function createPopoverTrail(definition?: PopoverSchemaDefinition): unknown {
  validateFactoryPlacement(isCurrentlyRenderingInReact());

  if (definition && typeof definition === 'object') {
    return createPopoverSchema(definition);
  }

  function PopoverProvider(props: PopoverProviderProps<unknown, unknown>) {
    return <CorePopoverProvider {...props} />;
  }
  PopoverProvider.displayName = 'PopoverProvider';

  function PopoverTrigger(props: PopoverTriggerProps<string>) {
    return <CorePopoverTrigger {...props} />;
  }
  PopoverTrigger.displayName = 'PopoverTrigger';

  function usePopover(key: string): UsePopoverResult<unknown> {
    return coreUsePopover(key);
  }

  function usePopoverActions() {
    return coreUsePopoverActions();
  }

  function usePopoverContext() {
    return coreUsePopoverContext();
  }

  return {
    PopoverProvider,
    PopoverPortal: CorePopoverPortal,
    PopoverTrigger,
    usePopover,
    usePopoverActions,
    usePopoverContext,
  };
}
