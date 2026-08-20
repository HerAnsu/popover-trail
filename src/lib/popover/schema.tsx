/**
 * Typed Schema Builder and Dynamic Type Inference Engine for popover-trail.
 * Provides compile-time autocompletion for popover keys, child hierarchy constraints,
 * data payloads, modular schema composition, and automated validation without `any` types.
 *
 * @module schema
 */

import React, { useMemo } from 'react';
import { PopoverTrigger, type PopoverTriggerProps } from './components/PopoverTrigger';
import {
  usePopover,
  usePopoverData,
  usePopoverEntry,
  usePopoverBreadcrumbs,
  usePopoverChildrenKeys,
  usePopoverParentKey,
  usePopoverDepth,
  useIsPopoverOpen,
  useIsPopoverPinned,
  useIsPopoverTopMost,
  usePopoverIsLoading,
} from './hooks/usePopoverSelectors';
import { usePopoverActions } from './context/usePopoverStore';
import type {
  PopoverResolver,
  PopoverDisplayOptions,
  OpenRootOptions,
  OpenNestedOptions,
  AnchorEventLike,
  TrailEntry,
  UsePopoverResult,
} from './types';
import { validateSchemaKey, validateSchemaCircularChild } from './validators';

/**
 * Node definition for an individual popover in a schema.
 *
 * Extends `PopoverDisplayOptions` to allow configuring default physics,
 * responsiveness, and positioning directly in the schema definition.
 *
 * @template TData - Resolved data payload type returned by the resolver.
 * @template TParentData - Data type of the parent popover when nested.
 * @template TContext - Global shared context type passed into resolvers.
 *
 * @example
 * ```typescript
 * const userNode: PopoverSchemaNode<UserData> = {
 *   resolver: async (userId, parentData, ctx, signal) => fetchUser(userId, signal),
 *   placement: 'right-start',
 *   children: ['details', 'settings'],
 *   responsiveMode: 'bottom-sheet',
 * };
 * ```
 */
export interface PopoverSchemaNode<
  TData = unknown,
  TParentData = unknown,
  TContext = unknown,
> extends PopoverDisplayOptions {
  /**
   * Data resolution function for this popover.
   *
   * @param key - The unique popover key being opened.
   * @param parentData - Resolved data payload from the parent popover (if nested).
   * @param context - Global context object provided to `<PopoverProvider>`.
   * @param signal - `AbortSignal` triggered if the popover closes before resolution completes.
   * @returns The data payload directly or a Promise resolving to it.
   */
  resolver: (
    key: string,
    parentData?: TParentData,
    context?: TContext,
    signal?: AbortSignal,
  ) => TData | Promise<TData>;

  /**
   * List of allowed child popover keys that can be nested under this popover.
   * Restricts `pushNested` to valid child keys at compile-time and runtime.
   */
  children?: ReadonlyArray<string>;
}

/** Record map of popover schema node definitions. */
export type PopoverSchemaDefinition = Record<string, PopoverSchemaNode>;

/**
 * Extracts a union of all valid string keys defined in a schema.
 *
 * @template TSchema - Popover schema definition.
 */
export type SchemaKeys<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;

/**
 * Alias for {@link SchemaKeys}. Extracts all valid string keys from a schema.
 *
 * @template TSchema - Popover schema definition.
 */
export type InferSchemaKeys<TSchema extends PopoverSchemaDefinition> = SchemaKeys<TSchema>;

/**
 * Maps every popover key in a schema to its exact resolved data payload type.
 *
 * @template TSchema - Popover schema definition.
 */
export type InferSchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in SchemaKeys<TSchema>]: SchemaData<TSchema, K>;
};

/**
 * Extracts the inferred global context type from schema node resolvers.
 *
 * @template TSchema - Popover schema definition.
 */
export type InferSchemaContext<TSchema extends PopoverSchemaDefinition> =
  TSchema[keyof TSchema] extends PopoverSchemaNode<unknown, unknown, infer TC> ? TC : unknown;

/**
 * Helper function for defining a single schema node with full type inference and IDE autocompletion.
 *
 * @template TData - Resolved data payload type.
 * @template TParentData - Parent popover data type.
 * @template TContext - Global shared context type.
 * @param node - Schema node definition options and resolver.
 * @returns The same node with enforced typing.
 *
 * @example
 * ```typescript
 * const userNode = defineSchemaNode({
 *   resolver: async (userId: string) => fetchUser(userId),
 *   placement: 'right',
 *   responsiveMode: 'bottom-sheet',
 *   children: ['details', 'settings'],
 * });
 * ```
 */
export function defineSchemaNode<TData, TParentData = unknown, TContext = unknown>(
  node: PopoverSchemaNode<TData, TParentData, TContext>,
): PopoverSchemaNode<TData, TParentData, TContext> {
  return node;
}

/**
 * Computes allowed child popover keys for a given parent key in a schema.
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
export type StrictPopoverKey<TSchema extends PopoverSchemaDefinition> = SchemaKeys<TSchema> & {
  readonly __schemaKeyBrand?: unique symbol;
};

/**
 * Validates and converts a string key into a branded {@link StrictPopoverKey}.
 *
 * @template TSchema - Popover schema definition.
 * @template K - Valid schema key literal.
 * @param _schema - Schema instance.
 * @param key - Schema key string.
 * @returns Branded schema key.
 */
export function toSchemaKey<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>>(
  _schema: PopoverSchemaInstance<TSchema>,
  key: K,
): StrictPopoverKey<TSchema> {
  return key as StrictPopoverKey<TSchema>;
}

/**
 * Extracts the resolved data payload type for a specific key in a schema.
 *
 * @template TSchema - Popover schema definition.
 * @template K - Specific popover key.
 */
export type SchemaData<TSchema extends PopoverSchemaDefinition, K extends SchemaKeys<TSchema>> =
  TSchema[K] extends PopoverSchemaNode<infer TData> ? Awaited<TData> : unknown;

/**
 * Strongly typed schema instance returned by {@link createPopoverSchema}.
 *
 * Supplies pre-typed triggers, selector hooks, and action dispatchers
 * bound specifically to the keys and payload types of the schema.
 *
 * @template TSchema - Schema definition mapping keys to schema nodes.
 * @template TContext - Global shared context type.
 */
export interface PopoverSchemaInstance<
  TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
> {
  /** The underlying raw schema node definitions. */
  readonly definition: TSchema;

  /**
   * Frozen map of valid schema keys for autocomplete and safe referencing.
   *
   * @example
   * ```typescript
   * schema.keys.user; // 'user'
   * ```
   */
  readonly keys: { readonly [K in SchemaKeys<TSchema>]: K };

  /**
   * Creates a unified {@link PopoverResolver} function compatible with `<PopoverProvider>`
   * that routes resolution requests to individual schema node resolvers.
   */
  createResolver: <TC = TContext>() => PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  >;

  /**
   * Pre-typed `<PopoverTrigger>` component whose `popoverKey` prop
   * is strictly typed to the keys of this schema.
   */
  Trigger: React.ComponentType<
    Omit<PopoverTriggerProps, 'popoverKey'> & { popoverKey: SchemaKeys<TSchema> }
  >;

  /**
   * Hook retrieving the resolved data payload for a popover key.
   *
   * @template K - Schema key.
   * @param key - Popover key to observe.
   * @returns Resolved data, `null` if not loaded, or `undefined` if key is not active.
   */
  useData: <K extends SchemaKeys<TSchema>>(key: K) => SchemaData<TSchema, K> | null | undefined;

  /**
   * Hook retrieving the full {@link TrailEntry} for a popover key.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns Active trail entry or `undefined`.
   */
  useEntry: <K extends SchemaKeys<TSchema>>(
    key: K,
  ) => TrailEntry<SchemaData<TSchema, K>> | undefined;

  /**
   * All-in-one hook returning data, status flags, and imperative actions for a key.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns Object with `{ entry, data, isLoading, error, isPinned, isOpen, isTop, close, togglePin, ... }`.
   */
  usePopover: <K extends SchemaKeys<TSchema>>(key: K) => UsePopoverResult<SchemaData<TSchema, K>>;

  /**
   * Hook returning the ancestor key path from root to the specified popover.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns Readonly array of ancestor keys.
   */
  useBreadcrumbs: <K extends SchemaKeys<TSchema>>(key: K) => readonly SchemaKeys<TSchema>[];

  /**
   * Hook returning the active direct child keys spawned from this popover.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns Readonly array of active child keys.
   */
  useChildren: <K extends SchemaKeys<TSchema>>(key: K) => readonly SchemaKeys<TSchema>[];

  /**
   * Hook returning the parent popover key, or `undefined` if root.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns Parent key or `undefined`.
   */
  useParent: <K extends SchemaKeys<TSchema>>(key: K) => SchemaKeys<TSchema> | undefined;

  /**
   * Hook returning the nesting depth level (0 for root).
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns 0-based depth integer.
   */
  useDepth: <K extends SchemaKeys<TSchema>>(key: K) => number;

  /**
   * Hook checking whether the specified popover is currently open.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns `true` if open.
   */
  useIsOpen: <K extends SchemaKeys<TSchema>>(key: K) => boolean;

  /**
   * Hook checking whether the specified popover is pinned as a floating window.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns `true` if pinned.
   */
  useIsPinned: <K extends SchemaKeys<TSchema>>(key: K) => boolean;

  /**
   * Hook checking whether the specified popover has the highest z-index.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns `true` if topmost.
   */
  useIsTopMost: <K extends SchemaKeys<TSchema>>(key: K) => boolean;

  /**
   * Hook checking whether data resolution is currently in progress for this key.
   *
   * @template K - Schema key.
   * @param key - Popover key.
   * @returns `true` if loading.
   */
  useIsLoading: <K extends SchemaKeys<TSchema>>(key: K) => boolean;

  /**
   * Hook providing pre-typed action dispatchers with schema key autocompletion
   * and compile-time child ancestry verification on `pushNested`.
   */
  useActions: () => {
    /** Opens a new root popover trail. */
    openRoot: <K extends SchemaKeys<TSchema>>(
      key: K,
      anchorEvent: AnchorEventLike,
      options?: OpenRootOptions,
    ) => Promise<void>;
    /** Pushes a child popover onto a parent popover, constrained by `children` hierarchy. */
    pushNested: <SK extends SchemaKeys<TSchema>>(
      key: AllowedChildrenOf<TSchema, SK>,
      sourceKey: SK,
      options?: OpenNestedOptions,
    ) => Promise<void>;
    /** Closes a specific popover by key. */
    close: (key: SchemaKeys<TSchema>, options?: { transition?: boolean }) => void;
    /** Closes all open popovers (both trailing and pinned). */
    closeAll: () => void;
    /** Toggles a popover between trailing cascade and pinned floating window. */
    togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => void;
    /** Brings a pinned popover to the front of the z-index stack. */
    bringToFront: (key: SchemaKeys<TSchema>) => void;
    /** Retries failed data resolution for a popover key. */
    retryPopover: (key: SchemaKeys<TSchema>) => Promise<void>;
    /** Prefetches data for a popover key without opening it. */
    prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) => Promise<unknown>;
    /** Invalidates cached data for one or more keys. */
    invalidate: (keyOrKeys: SchemaKeys<TSchema> | readonly SchemaKeys<TSchema>[]) => Promise<void>;
    /** Subscribes to entry updates for a specific key outside the render cycle. */
    subscribeKey: <K extends SchemaKeys<TSchema>>(
      key: K,
      listener: (
        entry: TrailEntry<SchemaData<TSchema, K>> | undefined,
        prevEntry: TrailEntry<SchemaData<TSchema, K>> | undefined,
      ) => void,
    ) => () => void;
    /** Clears the entire popover trail. */
    clear: () => void;
  };

  /**
   * Extends this schema with additional node definitions, returning a new merged schema instance.
   *
   * @template TExtra - Additional schema definition.
   * @param extraDefinition - Record of additional popover schema nodes.
   * @returns New combined schema instance.
   */
  extend: <TExtra extends PopoverSchemaDefinition>(
    extraDefinition: TExtra,
  ) => PopoverSchemaInstance<TSchema & TExtra, TContext>;
}

interface ParsedKeyParams<TC = unknown> {
  key?: string;
  parentData?: unknown;
  context?: TC;
  signal?: AbortSignal;
}

function isParsedKeyParams<TC>(val: unknown): val is ParsedKeyParams<TC> {
  return typeof val === 'object' && val !== null;
}

function parseResolverInvocationParams<TC>(
  rawKey: string | object,
  parentData?: unknown,
  context?: TC,
  signal?: AbortSignal,
): { key: string; parentData: unknown; context: TC | undefined; signal: AbortSignal | undefined } {
  if (isParsedKeyParams<TC>(rawKey)) {
    return {
      key: String(rawKey.key ?? ''),
      parentData: rawKey.parentData ?? parentData,
      context: rawKey.context ?? context,
      signal: rawKey.signal ?? signal,
    };
  }
  return {
    key: String(rawKey),
    parentData,
    context,
    signal,
  };
}

function mergeSchemaNodeOptions<TOptions extends OpenRootOptions | OpenNestedOptions>(
  node?: PopoverSchemaNode,
  options?: TOptions,
): TOptions {
  if (!node) return (options ?? {}) as TOptions;

  const merged: Record<string, unknown> = {};

  // Copy all defined display options from schema node
  for (const [k, v] of Object.entries(node)) {
    if (k !== 'resolver' && k !== 'children' && v !== undefined) {
      merged[k] = v;
    }
  }

  // Override with per-trigger options
  if (options) {
    for (const [k, v] of Object.entries(options)) {
      if (v !== undefined) {
        merged[k] = v;
      }
    }
  }

  return merged as TOptions;
}

/**
 * Validates schema tree integrity in development mode (fail-fast on typo children and direct circular loops).
 */
function validateSchemaIntegrity(definition: PopoverSchemaDefinition): void {
  const allKeys = new Set(Object.keys(definition));
  for (const [parentKey, node] of Object.entries(definition)) {
    if (!node?.children) continue;
    for (const childKey of node.children) {
      validateSchemaCircularChild(parentKey, childKey);
      if (!allKeys.has(childKey)) {
        validateSchemaKey(false, childKey);
      }
    }
  }
}

/**
 * Creates a strongly typed popover schema instance.
 *
 * Consolidates popover keys, child hierarchy constraints, data payload types,
 * default display options, and resolvers into a single type-safe object.
 *
 * @template TSchema - Schema definition mapping keys to schema nodes.
 * @template TContext - Global shared context type.
 * @param definition - Object map defining each popover in the schema.
 * @returns Strongly typed schema instance with bound `Trigger`, hooks (`useData`, `useEntry`, `usePopover`, etc.), and `createResolver`.
 *
 * @example
 * ```typescript
 * import { createPopoverSchema, defineSchemaNode } from 'popover-trail';
 *
 * interface User { id: string; name: string }
 * interface Settings { theme: string }
 *
 * export const appSchema = createPopoverSchema({
 *   user: defineSchemaNode<User>({
 *     resolver: async (id) => fetchUser(id),
 *     placement: 'bottom-start',
 *     children: ['settings'],
 *   }),
 *   settings: defineSchemaNode<Settings, User>({
 *     resolver: async (_key, parentUser) => fetchSettings(parentUser?.id),
 *     placement: 'right',
 *   }),
 * });
 *
 * // Use in React:
 * function Profile() {
 *   const user = appSchema.useData('user');
 *   const { pushNested } = appSchema.useActions();
 *   return (
 *     <div>
 *       <h1>{user?.name}</h1>
 *       <button onClick={() => pushNested('settings', 'user')}>Settings</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function createPopoverSchema<
  const TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
>(definition: TSchema): PopoverSchemaInstance<TSchema, TContext> {
  validateSchemaIntegrity(definition);

  const keysMap = {} as { [K in SchemaKeys<TSchema>]: K };
  for (const k of Object.keys(definition)) {
    (keysMap as Record<string, string>)[k] = k;
  }
  const keys = Object.freeze(keysMap);

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
    return usePopoverData<K, SchemaData<TSchema, K>>(key);
  };

  const useEntry = <K extends SchemaKeys<TSchema>>(
    key: K,
  ): TrailEntry<SchemaData<TSchema, K>, K> | undefined => {
    return usePopoverEntry<K, SchemaData<TSchema, K>>(key);
  };

  const useSchemaPopover = <K extends SchemaKeys<TSchema>>(
    key: K,
  ): UsePopoverResult<SchemaData<TSchema, K>> => {
    return usePopover<K, SchemaData<TSchema, K>>(key);
  };

  const useBreadcrumbs = <K extends SchemaKeys<TSchema>>(
    key: K,
  ): readonly SchemaKeys<TSchema>[] => {
    return usePopoverBreadcrumbs(key) as readonly SchemaKeys<TSchema>[];
  };

  const useChildren = <K extends SchemaKeys<TSchema>>(key: K): readonly SchemaKeys<TSchema>[] => {
    return usePopoverChildrenKeys(key) as readonly SchemaKeys<TSchema>[];
  };

  const useParent = <K extends SchemaKeys<TSchema>>(key: K): SchemaKeys<TSchema> | undefined => {
    return usePopoverParentKey(key) as SchemaKeys<TSchema> | undefined;
  };

  const useDepth = <K extends SchemaKeys<TSchema>>(key: K): number => {
    return usePopoverDepth(key);
  };

  const useIsOpen = <K extends SchemaKeys<TSchema>>(key: K): boolean => {
    return useIsPopoverOpen(key);
  };

  const useIsPinned = <K extends SchemaKeys<TSchema>>(key: K): boolean => {
    return useIsPopoverPinned(key);
  };

  const useIsTopMost = <K extends SchemaKeys<TSchema>>(key: K): boolean => {
    return useIsPopoverTopMost(key);
  };

  const useIsLoading = <K extends SchemaKeys<TSchema>>(key: K): boolean => {
    return usePopoverIsLoading(key);
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
        close: (key: SchemaKeys<TSchema>, options?: { transition?: boolean }) =>
          actions.closeByKey(key, options),
        closeAll: () => actions.closeAll(),
        togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => actions.togglePin(key, rect),
        bringToFront: (key: SchemaKeys<TSchema>) => actions.bringToFront(key),
        retryPopover: (key: SchemaKeys<TSchema>) => actions.retryPopover(key),
        prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) =>
          actions.prefetchPopover(key, parentData),
        invalidate: (keyOrKeys: SchemaKeys<TSchema> | readonly SchemaKeys<TSchema>[]) =>
          actions.invalidate(keyOrKeys as string | readonly string[]),
        subscribeKey: <K extends SchemaKeys<TSchema>>(
          key: K,
          listener: (
            entry: TrailEntry<SchemaData<TSchema, K>> | undefined,
            prevEntry: TrailEntry<SchemaData<TSchema, K>> | undefined,
          ) => void,
        ) =>
          actions.subscribeKey(
            key,
            listener as (entry: TrailEntry | undefined, prevEntry: TrailEntry | undefined) => void,
          ),
        clear: () => actions.clear(),
      }),
      [actions],
    );
  };

  const extend = <TExtra extends PopoverSchemaDefinition>(
    extraDefinition: TExtra,
  ): PopoverSchemaInstance<TSchema & TExtra, TContext> => {
    return createPopoverSchema({
      ...definition,
      ...extraDefinition,
    } as TSchema & TExtra);
  };

  return {
    definition,
    keys,
    createResolver,
    Trigger: SchemaTrigger,
    useData,
    useEntry,
    usePopover: useSchemaPopover,
    useBreadcrumbs,
    useChildren,
    useParent,
    useDepth,
    useIsOpen,
    useIsPinned,
    useIsTopMost,
    useIsLoading,
    useActions,
    extend,
  };
}

/**
 * Type helper extracting the raw definition object from a schema instance or definition.
 *
 * @template T - Schema instance or schema definition object.
 */
export type ExtractDefinition<T> = T extends { readonly definition: infer D }
  ? D extends PopoverSchemaDefinition
    ? D
    : PopoverSchemaDefinition
  : T extends PopoverSchemaDefinition
    ? T
    : PopoverSchemaDefinition;

/**
 * Type helper converting a union type `U` to an intersection type `I`.
 *
 * @template U - Union type.
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Computes the merged schema definition type from an array of schemas.
 *
 * @template TSchemas - Array of schema definitions or instances.
 */
export type MergedSchemaDefinition<
  TSchemas extends readonly (
    | PopoverSchemaDefinition
    | { readonly definition: PopoverSchemaDefinition }
  )[],
> =
  UnionToIntersection<ExtractDefinition<TSchemas[number]>> extends PopoverSchemaDefinition
    ? UnionToIntersection<ExtractDefinition<TSchemas[number]>>
    : PopoverSchemaDefinition;

/**
 * Merges multiple popover schema instances or definition objects into a single cohesive root schema.
 *
 * @template TSchemas - Array of schemas to merge.
 * @param schemas - Schema instances or definitions to combine.
 * @returns Unified schema instance containing all merged keys, nodes, and resolvers.
 *
 * @example
 * ```typescript
 * const userSchema = createPopoverSchema({ user: defineSchemaNode(...) });
 * const billingSchema = createPopoverSchema({ billing: defineSchemaNode(...) });
 *
 * export const appSchema = mergePopoverSchemas(userSchema, billingSchema);
 * // appSchema.keys has 'user' and 'billing' with full autocompletion.
 * ```
 */
export function mergePopoverSchemas<
  const TSchemas extends readonly (
    | PopoverSchemaDefinition
    | { readonly definition: PopoverSchemaDefinition }
  )[],
>(...schemas: TSchemas): PopoverSchemaInstance<MergedSchemaDefinition<TSchemas>> {
  const mergedDefinition: Record<string, PopoverSchemaNode> = {};

  for (const s of schemas) {
    const def = ('definition' in s ? s.definition : s) as Record<string, PopoverSchemaNode>;
    if (def && typeof def === 'object') {
      Object.assign(mergedDefinition, def);
    }
  }

  return createPopoverSchema<MergedSchemaDefinition<TSchemas>>(
    mergedDefinition as MergedSchemaDefinition<TSchemas>,
  );
}

/**
 * Mapped type extracting all valid string keys from a schema definition.
 *
 * @template TSchema - Popover schema definition.
 */
export type SchemaKeyOf<TSchema extends PopoverSchemaDefinition> = Extract<keyof TSchema, string>;

/**
 * Mapped type extracting a record of key-to-data-payload types from a schema definition.
 *
 * @template TSchema - Popover schema definition.
 */
export type SchemaDataMap<TSchema extends PopoverSchemaDefinition> = {
  [K in keyof TSchema]: TSchema[K] extends PopoverSchemaNode<infer TD, infer _TP, infer _TC>
    ? TD
    : never;
};
