/**
 * Type Contracts and Node Definitions for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaTypes
 */

import type { ComponentType } from 'react';
import type {
  PopoverDisplayOptions,
  PopoverResolver,
  TrailEntry,
  UsePopoverResult,
} from '../types';
import type { PopoverTriggerProps } from '../components/PopoverTrigger';
import type { Brand } from '../types/branded';
import type { SchemaActionsHook } from './schemaActionTypes';

export interface PopoverSchemaNode<
  TData = unknown,
  TParentData = unknown,
  TContext = unknown,
> extends PopoverDisplayOptions {
  resolver: (
    key: string,
    parentData?: TParentData,
    context?: TContext,
    signal?: AbortSignal,
  ) => TData | Promise<TData>;
  children?: ReadonlyArray<string>;
}

export type PopoverSchemaDefinition = Record<string, PopoverSchemaNode>;
export type SchemaKeys<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;
export type InferSchemaKeys<TSchema extends PopoverSchemaDefinition> = SchemaKeys<TSchema>;

export type InferSchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in SchemaKeys<TSchema>]: SchemaData<TSchema, K>;
};

export type InferSchemaContext<TSchema extends PopoverSchemaDefinition> =
  TSchema[keyof TSchema] extends PopoverSchemaNode<unknown, unknown, infer TC> ? TC : unknown;

export type AllowedChildrenOf<
  TSchema extends PopoverSchemaDefinition,
  KSource extends SchemaKeys<TSchema>,
> = TSchema[KSource] extends { children: ReadonlyArray<infer C> }
  ? Extract<C, SchemaKeys<TSchema>>
  : SchemaKeys<TSchema>;

export type StrictPopoverKey<TSchema extends PopoverSchemaDefinition> = Brand<
  SchemaKeys<TSchema>,
  'StrictPopoverKey'
>;

export type SchemaData<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>> =
  TSchema[K] extends PopoverSchemaNode<infer TData> ? Awaited<TData> : unknown;

export interface PopoverSchemaInstance<
  TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
> {
  readonly definition: TSchema;
  readonly keys: { readonly [K in SchemaKeys<TSchema>]: K };
  createResolver: <TC = TContext>() => PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  >;
  Trigger: ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  >;
  useData: <K extends SchemaKeys<TSchema>>(key: K) => SchemaData<TSchema, K> | null | undefined;
  useEntry: <K extends SchemaKeys<TSchema>>(
    key: K,
  ) => TrailEntry<SchemaData<TSchema, K>> | undefined;
  usePopover: <K extends SchemaKeys<TSchema>>(key: K) => UsePopoverResult<SchemaData<TSchema, K>>;
  useBreadcrumbs: <K extends SchemaKeys<TSchema>>(key: K) => readonly SchemaKeys<TSchema>[];
  useChildren: <K extends SchemaKeys<TSchema>>(key: K) => readonly SchemaKeys<TSchema>[];
  useParent: <K extends SchemaKeys<TSchema>>(key: K) => SchemaKeys<TSchema> | undefined;
  useDepth: <K extends SchemaKeys<TSchema>>(key: K) => number;
  useIsOpen: <K extends SchemaKeys<TSchema>>(key: K) => boolean;
  useIsPinned: <K extends SchemaKeys<TSchema>>(key: K) => boolean;
  useIsTopMost: <K extends SchemaKeys<TSchema>>(key: K) => boolean;
  useIsLoading: <K extends SchemaKeys<TSchema>>(key: K) => boolean;
  useActions: () => SchemaActionsHook<TSchema>;
  extend: <TExtra extends PopoverSchemaDefinition>(
    extraDefinition: TExtra,
  ) => PopoverSchemaInstance<TSchema & TExtra, TContext>;
}
