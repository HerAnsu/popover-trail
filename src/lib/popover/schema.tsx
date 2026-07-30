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
  /** Resolver function to load data for this popover. */
  resolver: (key: string, parentData?: TParentData, context?: TContext) => TData | Promise<TData>;
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

/**
 * Type helper computing the allowed child popover schema keys for a given parent source key.
 * If the parent schema node explicitly declares `children`, restricts autocompletion strictly to those keys.
 *
 * @template TSchema - Popover schema definition.
 * @template KSource - Parent popover key.
 */
export type AllowedChildrenOf<
  TSchema extends PopoverSchemaDefinition,
  KSource extends SchemaKeys<TSchema>,
> = TSchema[KSource] extends { children: ReadonlyArray<infer C> }
  ? Extract<C, SchemaKeys<TSchema>>
  : SchemaKeys<TSchema>;

/**
 * Branded type for strict schema keys, preventing passing unvalidated string literals.
 *
 * @template TSchema - Popover schema definition.
 */
export type StrictPopoverKey<TSchema extends PopoverSchemaDefinition> =
  SchemaKeys<TSchema> & { readonly __schemaKeyBrand: unique symbol };

/**
 * Identity converter validating and returning a strongly typed schema key.
 *
 * @template TSchema - Popover schema definition.
 * @template K - Valid schema key string literal.
 * @param _schema - Target schema instance.
 * @param key - Schema key string.
 * @returns Validated schema key.
 *
 * @example
 * ```typescript
 * const key = toSchemaKey(appSchema, 'userProfile');
 * ```
 */
export function toSchemaKey<
  TSchema extends PopoverSchemaDefinition,
  K extends SchemaKeys<TSchema>,
>(
  _schema: PopoverSchemaInstance<TSchema>,
  key: K,
): K {
  return key;
}

/** Helper to extract resolved data payload type for a specific key in a schema. */
export type SchemaData<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>> =
  TSchema[K] extends PopoverSchemaNode<infer TData> ? TData : unknown;

/** Strongly typed Schema Instance object returned by `createPopoverSchema`. */
export interface PopoverSchemaInstance<TSchema extends PopoverSchemaDefinition> {
  /** The underlying raw schema definitions. */
  definition: TSchema;
  /** Auto-completing map of valid schema keys. */
  keys: { [K in SchemaKeys<TSchema>]: K };
  /** Generates a unified PopoverResolver function for PopoverProvider with schema data payload inference. */
  createResolver: <TContext = unknown>() => PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TContext
  >;
  /** Strongly typed PopoverTrigger component bound to schema keys. */
  Trigger: React.ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  >;
  /** Strongly typed hook for accessing resolved data by schema key. */
  useData: <K extends SchemaKeys<TSchema>>(key: K) => SchemaData<TSchema, K> | undefined;
  /** Strongly typed hook for accessing active trail entry by schema key. */
  useEntry: <K extends SchemaKeys<TSchema>>(
    key: K,
  ) => TrailEntry<SchemaData<TSchema, K>> | undefined;
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
    togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => void;
  };
}

/**
 * Factory function creating a strongly typed Popover Schema.
 * Consolidates popover definitions, key types, data payload types, placement defaults, and resolvers.
 *
 * @template TSchema - The popover schema definition type.
 * @param definition - Object map defining each popover in the schema.
 * @returns Strongly typed schema instance with bound triggers, hooks, keys, and unified resolver.
 *
 * @example
 * ```tsx
 * import { createPopoverSchema, PopoverProvider } from 'popover-trail';
 *
 * export const appSchema = createPopoverSchema({
 *   userProfile: {
 *     resolver: async (key) => ({ name: 'Alex', id: 'usr_1' }),
 *     placement: 'right',
 *     children: ['userStats'],
 *   },
 *   userStats: {
 *     resolver: async (key, parentData) => ({ score: 100 }),
 *     placement: 'bottom',
 *   },
 * });
 *
 * function App() {
 *   return (
 *     <PopoverProvider schema={appSchema}>
 *       <appSchema.Trigger popoverKey="userProfile">
 *         <button>Open User Profile</button>
 *       </appSchema.Trigger>
 *     </PopoverProvider>
 *   );
 * }
 * ```
 *
 * @see {@link PopoverProvider}
 * @see {@link createPopoverStore}
 * @see {@link createPopoverTrail}
 */
export function createPopoverSchema<const TSchema extends PopoverSchemaDefinition>(
  definition: TSchema,
): PopoverSchemaInstance<TSchema> {
  const keys = Object.fromEntries(Object.keys(definition).map((k) => [k, k])) as {
    [K in SchemaKeys<TSchema>]: K;
  };

  const createResolver = <TContext = unknown,>(): PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TContext
  > => {
    return (key: string, parentData?: unknown, context?: TContext) => {
      const hasNode = Object.prototype.hasOwnProperty.call(definition, key);
      const node = hasNode ? definition[key] : undefined;
      validateSchemaKey(Boolean(node), key);
      if (node && typeof node.resolver === 'function') {
        return node.resolver(key, parentData, context) as ReturnType<
          PopoverResolver<SchemaData<TSchema, SchemaKeys<TSchema>>, TContext>
        >;
      }
      return Promise.reject(new Error(`No schema resolver defined for key: "${key}"`));
    };
  };

  const SchemaTrigger: React.ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  > = ({ popoverKey, placement, offset, options, ...restProps }) => {
    const node = definition[popoverKey];
    const mergedPlacement = placement ?? node?.placement;
    const mergedOffset = offset ?? node?.offset;
    const mergedOptions = useMemo(
      () => ({
        collision: node?.collision,
        hover: node?.hover,
        allowDragWhenPinned: node?.allowDragWhenPinned,
        allowDragWhenUnpinned: node?.allowDragWhenUnpinned,
        ...options,
      }),
      [
        node?.collision,
        node?.hover,
        node?.allowDragWhenPinned,
        node?.allowDragWhenUnpinned,
        options,
      ],
    );

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

  const useData = <K extends SchemaKeys<TSchema>>(key: K): SchemaData<TSchema, K> | undefined => {
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
          validateSchemaKey(Boolean(node), key as string);
          const mergedOptions = {
            placement: node?.placement,
            offset: node?.offset,
            collision: node?.collision,
            hover: node?.hover,
            ...options,
          };
          return actions.openRootWithResolver(key, anchorEvent, mergedOptions);
        },
        pushNested: <K extends SchemaKeys<TSchema>>(
          key: K,
          sourceKey: string,
          options?: OpenNestedOptions,
        ) => {
          const node = definition[key];
          validateSchemaKey(Boolean(node), key as string);
          const mergedOptions = {
            placement: node?.placement,
            offset: node?.offset,
            collision: node?.collision,
            hover: node?.hover,
            ...options,
          };
          return actions.openNestedWithResolver(key, sourceKey, mergedOptions);
        },
        close: (key: SchemaKeys<TSchema>) => actions.closeByKey(key),
        togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => actions.togglePin(key, rect),
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
