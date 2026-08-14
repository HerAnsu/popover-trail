import React, { useMemo } from 'react';
import { PopoverTrigger, type PopoverTriggerProps } from './components/PopoverTrigger';
import { usePopoverData, usePopoverEntry } from './hooks/usePopoverSelectors';
import { usePopoverActions } from './context/usePopoverStore';
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
 * @template TData - Resolved data payload type returned by the resolver.
 * @template TParentData - Data type of the parent popover when nested.
 * @template TContext - Global shared context type passed into resolvers.
 */
export interface PopoverSchemaNode<TData = unknown, TParentData = unknown, TContext = unknown> {
  /**
   * Resolver function to load data for this popover.
   * Supports asynchronous operations and request cancellation via AbortSignal.
   *
   * @param key - The unique popover key being resolved.
   * @param parentData - Resolved data payload from the parent popover if nested.
   * @param context - Global context object provided to the PopoverProvider.
   * @param signal - AbortSignal triggered if the popover closes before resolution finishes.
   * @returns Data payload directly or a Promise resolving to data.
   */
  resolver: (
    key: string,
    parentData?: TParentData,
    context?: TContext,
    signal?: AbortSignal,
  ) => TData | Promise<TData>;
  /** Optional list of allowed child popover keys that can be spawned from this parent. */
  children?: ReadonlyArray<string>;
  /** Default layout placement relative to the trigger. */
  placement?: PopoverPlacement;
  /** Distance gap in pixels between the trigger element and the popover. */
  offset?: number;
  /** Boundary collision and flip behavior settings. */
  collision?: CollisionConfig;
  /** Hover-trigger delay and interaction settings. */
  hover?: HoverConfig;
  /** Whether the card can be dragged with pointer when pinned. */
  allowDragWhenPinned?: boolean;
  /** Whether the card can be dragged with pointer when unpinned. */
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
 * Helper to define an individual schema node with full type inference and editor autocompletion.
 *
 * @remarks
 * Use this helper when defining schema nodes in separate modules before combining them into a full schema.
 *
 * @example
 * ```typescript
 * const userNode = defineSchemaNode({
 *   resolver: async (userId: string) => fetchUser(userId),
 *   placement: 'right',
 *   children: ['details', 'settings'],
 * });
 * ```
 *
 * @param node - The schema node configuration object.
 * @returns The exact typed schema node.
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

function parseResolverInvocationParams<TC>(
  rawKey: string | object,
  parentData?: unknown,
  context?: TC,
  signal?: AbortSignal,
): { key: string; parentData: unknown; context: TC | undefined; signal: AbortSignal | undefined } {
  if (typeof rawKey === 'object' && rawKey !== null) {
    const obj = rawKey as {
      key?: string;
      parentData?: unknown;
      context?: TC;
      signal?: AbortSignal;
    };
    return {
      key: String(obj.key ?? ''),
      parentData: obj.parentData ?? parentData,
      context: obj.context ?? context,
      signal: obj.signal ?? signal,
    };
  }
  return {
    key: String(rawKey),
    parentData,
    context,
    signal,
  };
}

/**
 * Factory function creating a strongly typed Popover Schema.
 * Consolidates popover definitions, keys, data payload types, placement defaults, and resolvers.
 *
 * @remarks
 * In schema mode, all popover keys, child relationship constraints, and data payload types
 * are inferred at compile-time. The returned instance exposes typed hooks (`useData`, `useEntry`, `useActions`)
 * and a schema-bound `Trigger` component.
 *
 * @example
 * ```tsx
 * const schema = createPopoverSchema({
 *   user: {
 *     resolver: async (id: string) => fetchUser(id),
 *     placement: 'right',
 *     children: ['details'],
 *   },
 *   details: {
 *     resolver: async (id: string, parentUser) => fetchUserDetails(id, parentUser),
 *     placement: 'bottom',
 *   },
 * });
 *
 * // Access typed actions and data
 * const { openRoot, pushNested } = schema.useActions();
 * const userData = schema.useData('user');
 * ```
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
    return (rawKey: string | object, parentData?: unknown, context?: TC, signal?: AbortSignal) => {
      const parsed = parseResolverInvocationParams(rawKey, parentData, context, signal);
      const hasNode = Object.hasOwn(definition, parsed.key);
      const node = hasNode ? definition[parsed.key] : undefined;
      validateSchemaKey(Boolean(node), parsed.key);

      if (node && typeof node.resolver === 'function') {
        return Promise.resolve(
          node.resolver(parsed.key, parsed.parentData, parsed.context, parsed.signal),
        ) as ReturnType<PopoverResolver<SchemaData<TSchema, SchemaKeys<TSchema>>, TC>>;
      }
      return Promise.reject(new Error(`No schema resolver defined for key: "${parsed.key}"`));
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
