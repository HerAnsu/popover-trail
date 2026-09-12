/**
 * Factory Type Definitions and Signatures.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module factoryTypes
 */

import type React from 'react';
import type { PopoverProviderProps } from './context/PopoverProviderProps';
import type { usePopoverActions as coreUsePopoverActions } from './context/usePopoverStore';
import type { PopoverTrigger as CorePopoverTrigger } from './components/PopoverTrigger';
import type { PopoverPortal as CorePopoverPortal } from './components/PopoverPortal';
import type {
  usePopover as coreUsePopover,
  usePopoverContext as coreUsePopoverContext,
  UsePopoverResult,
} from './hooks/usePopoverSelectors';
import type { PopoverSchemaDefinition, PopoverSchemaInstance } from './schema';
import type { RegisteredKeys } from './types/registerTypes';

export type FactorySchemaSuite<TSchema extends PopoverSchemaDefinition> =
  PopoverSchemaInstance<TSchema> & {
    PopoverProvider: React.ComponentType<PopoverProviderProps<unknown, unknown>>;
    PopoverTrigger: typeof CorePopoverTrigger;
    PopoverPortal: typeof CorePopoverPortal;
    usePopover: typeof coreUsePopover;
    usePopoverActions: typeof coreUsePopoverActions;
    usePopoverContext: typeof coreUsePopoverContext;
  };

export interface FactoryGenericSuite<TData, TContext> {
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  PopoverTrigger: typeof CorePopoverTrigger;
  PopoverPortal: typeof CorePopoverPortal;
  usePopover: <K extends string = RegisteredKeys>(key: K) => UsePopoverResult<TData>;
  usePopoverActions: () => ReturnType<typeof coreUsePopoverActions<TData, TContext>>;
  usePopoverContext: () => TContext;
}
