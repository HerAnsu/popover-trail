import React, { useMemo } from 'react';
import { PopoverTrigger, type PopoverTriggerProps } from './components/PopoverTrigger';
import { usePopoverData, usePopoverEntry, usePopoverActions } from './context';
import type {
  PopoverResolver,
  PopoverPlacement,
  CollisionConfig,
  HoverConfig,
  OpenRootOptions,
  OpenNestedOptions,
  AnchorEventLike,
  TrailEntry,
} from './types';
import { validateSchemaKey } from './utils/devWarnings';

/**
 * Definition node configuration for a single popover in the schema.
 *
 * @template TData - Resolved data payload type.
 * @template TParentData - Data type of parent popover if nested.
 * @template TContext - Custom context type.
 */
export interface PopoverSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown> {
  /** Resolver function to load data for this popover. Supports cancellable AbortSignal. */
  resolver: (
    key: string,
    parentData?: TParentData,
    context?: TContext,
    signal?: AbortSignal,
  ) => TData | Promise<TData>;
  /** Optional list of allowed nested child popover schema keys spawned by this parent. */
  children?: ReadonlyArray<string>;
  /** Default layout placement. */
  placement?: PopoverPlacement;
  /** Default trigger distance gap offset in pixels. */
  offset?: number;
  /** Boundary collision configuration. */
  collision?: CollisionConfig;
  /** Hover-trigger configuration. */
  hover?: HoverConfig;
  /** Allow dragging when pinned. */
  allowDragWhenPinned?: boolean;
  /** Allow dragging when unpinned. */
  allowDragWhenUnpinned?: boolean;
}

/** Record map of popover schema node definitions. */
export type PopoverSchemaDefinition = Record<string, PopoverSchemaNode>;

/** Helper to extract valid key union from a schema definition. */
export type SchemaKeys<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;

/** Type helper extracting inferred key union from a schema definition. */
export type InferSchemaKeys<TSchema extends PopoverSchemaDefinition> = SchemaKeys<TSchema>;

/**
 * Type helper mapping every popover key in a schema to its exact resolved data payload type.
 * Generates an application-wide data map interface for type-safe caching and telemetry.
 */
export type InferSchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in SchemaKeys<TSchema>]: SchemaData<TSchema, K>;
};

/** Type helper extracting inferred global context type from schema node resolvers. */
export type InferSchemaContext<TSchema extends PopoverSchemaDefinition> =
  TSchema[keyof TSchema] extends PopoverSchemaNode<unknown, unknown, infer TC> ? TC : unknown;

/**
 * Ergonomic helper to define an individual schema node with full type inference and autocompletion.
 */
export function defineSchemaNode<TData, TParentData = unknown, TContext = unknown>(
  node: PopoverSchemaNode<TData, TParentData, TContext>,
): PopoverSchemaNode<TData, TParentData, TContext> {
  return node;
}

/**
 * Type helper computing the allowed child popover schema keys for a given parent source key.
 * If the parent schema node explicitly declares `children`, restricts autocompletion strictly to those keys.
 */
export type AllowedChildrenOf<
  TSchema extends PopoverSchemaDefinition,
  KSource extends SchemaKeys<TSchema>,
> = TSchema[KSource] extends { children: ReadonlyArray<infer C> }
  ? Extract<C, SchemaKeys<TSchema>>
  : SchemaKeys<TSchema>;

/**
 * Branded type for strict schema keys, preventing passing unvalidated string literals.
 */
export type StrictPopoverKey<TSchema extends PopoverSchemaDefinition> = SchemaKeys<TSchema> & {
  readonly __schemaKeyBrand: unique symbol;
};

/**
 * Identity converter validating and returning a strongly typed schema key.
 */
export function toSchemaKey<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>>(
  _schema: PopoverSchemaInstance<TSchema>,
  key: K,
): StrictPopoverKey<TSchema> {
  return key as unknown as StrictPopoverKey<TSchema>;
}

/** Helper to extract resolved data payload type for a specific key in a schema. */
export type SchemaData<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>> =
  TSchema[K] extends PopoverSchemaNode<infer TData> ? Awaited<TData> : unknown;

/** Strongly typed Schema Instance object returned by `createPopoverSchema`. */
export interface PopoverSchemaInstance<
  TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
> {
  /** The underlying raw schema definitions. */
  definition: TSchema;
  /** Auto-completing map of valid schema keys. */
  keys: { [K in SchemaKeys<TSchema>]: K };
  /** Generates a unified PopoverResolver function for PopoverProvider with schema data payload inference. */
  createResolver: <TC = TContext>() => PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  >;
  /** Strongly typed PopoverTrigger component bound to schema keys. */
  Trigger: React.ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  >;
  /** Strongly typed hook for accessing resolved data by schema key. */
  useData: <K extends SchemaKeys<TSchema>>(key: K) => SchemaData<TSchema, K> | null | undefined;
  /** Strongly typed hook for accessing active trail entry by schema key. */
  useEntry<K extends SchemaKeys<TSchema>>(key: K): TrailEntry<SchemaData<TSchema, K>> | undefined;
  /** Strongly typed hook for dispatching store actions with schema key autocompletion and ancestry validation. */
  useActions: () => {
    openRoot: <K extends SchemaKeys<TSchema>>(
      key: K,
      anchorEvent: AnchorEventLike,
      options?: OpenRootOptions,
    ) => Promise<void>;
    pushNested: <SK extends SchemaKeys<TSchema>>(
      key: AllowedChildrenOf<TSchema, SK>,
      sourceKey: SK,
      options?: OpenNestedOptions,
    ) => Promise<void>;
    close: (key: SchemaKeys<TSchema>) => void;
    closeAll: () => void;
    togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => void;
    bringToFront: (key: SchemaKeys<TSchema>) => void;
    retryPopover: (key: SchemaKeys<TSchema>) => Promise<void>;
    prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) => Promise<unknown>;
    clear: () => void;
  };
}

/**
 * Factory function creating a strongly typed Popover Schema.
 * Consolidates popover definitions, key types, data payload types, placement defaults, and resolvers.
 *
 * @template TSchema - The popover schema definition type.
 * @template TContext - Global shared context type.
 * @param definition - Object map defining each popover in the schema.
 * @returns Strongly typed schema instance with bound triggers, hooks, keys, and unified resolver.
 */
export function createPopoverSchema<
  const TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
>(definition: TSchema): PopoverSchemaInstance<TSchema, TContext> {
  const keysMap = {} as { [K in SchemaKeys<TSchema>]: K };
  for (const k of Object.keys(definition)) {
    (keysMap as Record<string, string>)[k] = k;
  }
  const keys = keysMap;

  const createResolver = <TC = TContext,>(): PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  > => {
    return (key: string, parentData?: unknown, context?: TC, signal?: AbortSignal) => {
      const hasNode = Object.prototype.hasOwnProperty.call(definition, key);
      const node = hasNode ? definition[key] : undefined;
      validateSchemaKey(Boolean(node), key);
      if (node && typeof node.resolver === 'function') {
        return Promise.resolve(node.resolver(key, parentData, context, signal)) as ReturnType<
          PopoverResolver<SchemaData<TSchema, SchemaKeys<TSchema>>, TC>
        >;
      }
      return Promise.reject(new Error(`No schema resolver defined for key: "${key}"`));
    };
  };

  function mergeSchemaNodeOptions<TOptions extends OpenRootOptions | OpenNestedOptions>(
    node?: PopoverSchemaNode,
    options?: TOptions,
  ): TOptions {
    return {
      placement: node?.placement,
      offset: node?.offset,
      collision: node?.collision,
      hover: node?.hover,
      allowDragWhenPinned: node?.allowDragWhenPinned,
      allowDragWhenUnpinned: node?.allowDragWhenUnpinned,
      ...options,
    } as TOptions;
  }

  const SchemaTrigger: React.ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  > = ({ popoverKey, placement, offset, options, ...restProps }) => {
    const node = definition[popoverKey];
    const mergedPlacement = placement ?? node?.placement;
    const mergedOffset = offset ?? node?.offset;
    const mergedOptions = useMemo(() => mergeSchemaNodeOptions(node, options), [node, options]);

    return (
      <PopoverTrigger
        popoverKey={popoverKey}
        placement={mergedPlacement}
        offset={mergedOffset}
        options={mergedOptions}
        {...restProps}
      />
    );
  };
  SchemaTrigger.displayName = 'PopoverSchemaTrigger';

  const useData = <K extends SchemaKeys<TSchema>>(
    key: K,
  ): SchemaData<TSchema, K> | null | undefined => {
    return usePopoverData<SchemaData<TSchema, K>>(key);
  };

  const useEntry = <K extends SchemaKeys<TSchema>>(
    key: K,
  ): TrailEntry<SchemaData<TSchema, K>> | undefined => {
    return usePopoverEntry<SchemaData<TSchema, K>>(key);
  };

  const useActions = () => {
    const actions = usePopoverActions();
    return useMemo(
      () => ({
        openRoot: <K extends SchemaKeys<TSchema>>(
          key: K,
          anchorEvent: AnchorEventLike,
          options?: OpenRootOptions,
        ) => {
          const node = definition[key];
          const strKey = String(key);
          validateSchemaKey(Boolean(node), strKey);
          const mergedOptions = mergeSchemaNodeOptions(node, options);
          return actions.openRootWithResolver(strKey, anchorEvent, mergedOptions);
        },
        pushNested: <SK extends SchemaKeys<TSchema>>(
          key: AllowedChildrenOf<TSchema, SK>,
          sourceKey: SK,
          options?: OpenNestedOptions,
        ) => {
          const strKey = String(key);
          const strSourceKey = String(sourceKey);
          const node = definition[strKey];
          validateSchemaKey(Boolean(node), strKey);
          const mergedOptions = mergeSchemaNodeOptions(node, options);
          return actions.openNestedWithResolver(strKey, strSourceKey, mergedOptions);
        },
        close: (key: SchemaKeys<TSchema>) => actions.closeByKey(key),
        closeAll: () => actions.closeAll(),
        togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => actions.togglePin(key, rect),
        bringToFront: (key: SchemaKeys<TSchema>) => actions.bringToFront(key),
        retryPopover: (key: SchemaKeys<TSchema>) => actions.retryPopover(key),
        prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) =>
          actions.prefetchPopover(key, parentData),
        clear: () => actions.clear(),
      }),
      [actions],
    );
  };

  return {
    definition,
    keys,
    createResolver,
    Trigger: SchemaTrigger,
    useData,
    useEntry,
    useActions,
  };
}

/** Utility mapped type extracting all valid string keys from a schema definition. */
export type SchemaKeyOf<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;

/** Utility mapped type extracting a record of key-to-data-payload types from a schema definition. */
export type SchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in keyof TSchema]: TSchema[K] extends PopoverSchemaNode<infer TD, infer _TP, infer _TC>
    ? TD
    : never;
};
