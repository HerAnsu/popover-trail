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

/**
 * Unified factory for creating popover trail instances or schema definitions.
 * Overloaded to support both schema-driven definitions and generic type bindings.
 *
 * @param definition - Optional schema definition map.
 */
export function createPopoverTrail<TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): PopoverSchemaInstance<TSchema>;
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
