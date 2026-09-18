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

/**
 * Factory-generated suite with pre-bound schema instances, providers, and hooks.
 *
 * @template TSchema - Schema definition mapping keys to node configurations.
 */
export type FactorySchemaSuite<TSchema extends PopoverSchemaDefinition> =
  PopoverSchemaInstance<TSchema> & {
    /** Root provider pre-configured with the provided schema. */
    PopoverProvider: React.ComponentType<PopoverProviderProps<unknown, unknown>>;
    /** Anchor trigger component. */
    PopoverTrigger: typeof CorePopoverTrigger;
    /** Portal component rendering active popover cards. */
    PopoverPortal: typeof CorePopoverPortal;
    /** Hook to read state and data for a specific popover key. */
    usePopover: typeof coreUsePopover;
    /** Hook to access trail control actions (open, close, toggle, pin). */
    usePopoverActions: typeof coreUsePopoverActions;
    /** Hook to access the ambient context value. */
    usePopoverContext: typeof coreUsePopoverContext;
  };

/**
 * Generic factory-generated suite for type-safe data and context without an explicit schema.
 *
 * @template TData - Popover resolved data payload type.
 * @template TContext - Ambient context type.
 */
export interface FactoryGenericSuite<TData, TContext> {
  /** Root provider component for popover-trail state. */
  PopoverProvider: React.ComponentType<PopoverProviderProps<TData, TContext>>;
  /** Anchor trigger component. */
  PopoverTrigger: typeof CorePopoverTrigger;
  /** Portal component rendering active popover cards. */
  PopoverPortal: typeof CorePopoverPortal;
  /** Hook to read state and data for a specific popover key. */
  usePopover: <K extends string = RegisteredKeys>(key: K) => UsePopoverResult<TData>;
  /** Hook to access trail control actions (open, close, toggle, pin). */
  usePopoverActions: () => ReturnType<typeof coreUsePopoverActions<TData, TContext>>;
  /** Hook to access the ambient context value. */
  usePopoverContext: () => TContext;
}
