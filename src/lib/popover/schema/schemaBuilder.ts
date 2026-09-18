/**
 * Schema Instance Builder and Merger for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaBuilder
 */

import {
  usePopover,
  usePopoverData,
  usePopoverEntry,
  usePopoverBreadcrumbs,
  usePopoverChildrenKeys,
  usePopoverParentKey,
  usePopoverDepth,
  usePopoverIsOpen,
  usePopoverIsPinned,
  usePopoverIsTopMost,
  usePopoverIsLoading,
} from '../hooks/usePopoverSelectors';
import { validateSchemaKey } from '../validators';
import type { PopoverResolver } from '../types';
import { keyBy } from '../utils/collections';
import { identity } from '../utils/functional';
import type {
  PopoverSchemaDefinition,
  PopoverSchemaInstance,
  InferSchemaContext,
  SchemaKeys,
  SchemaData,
} from './schemaTypes';
import { validateSchemaIntegrity } from './schemaValidation';
import { parseResolverInvocationParams } from './schemaParams';
import { createSchemaTrigger } from './schemaTrigger';
import { createSchemaActionsHook } from './schemaActions';
import { isValidSchemaKey } from './schemaGuards';

/**
 * Creates a strongly typed popover schema instance from a declarative dictionary of schema nodes.
 *
 * Provides type-safe access to keys, data resolvers, polymorphic triggers, specialized hooks
 * (`useData`, `useEntry`, `usePopover`, `useBreadcrumbs`, etc.), and typed actions.
 *
 * @example
 * ```tsx
 * const schema = createPopoverSchema({
 *   user: defineSchemaNode({
 *     resolver: async (key: string) => fetchUser(key),
 *     children: ['profile', 'settings'],
 *   }),
 *   profile: defineSchemaNode({
 *     resolver: async (key, parentData: User) => fetchProfile(parentData.id),
 *   }),
 * });
 *
 * export function App() {
 *   return <PopoverProvider schema={schema}><Main /></PopoverProvider>;
 * }
 * ```
 *
 * @template TSchema - Declarative map of node keys to PopoverSchemaNode configurations.
 * @template TContext - Inferred ambient context type across schema nodes.
 * @param definition - Schema configuration dictionary.
 * @returns PopoverSchemaInstance with typed keys, hooks, Trigger component, and resolver factory.
 */
export function createPopoverSchema<
  const TSchema extends PopoverSchemaDefinition,
  TContext = InferSchemaContext<TSchema>,
>(definition: TSchema): PopoverSchemaInstance<TSchema, TContext> {
  validateSchemaIntegrity(definition);

  const keys = Object.freeze(keyBy(Object.keys(definition), identity)) as {
    readonly [K in SchemaKeys<TSchema>]: K;
  };

  const createResolver = <TC = TContext>(): PopoverResolver<
    SchemaData<TSchema, SchemaKeys<TSchema>>,
    TC
  > => {
    return (rawKey: string | object, parentData?: unknown, context?: TC, signal?: AbortSignal) => {
      const parsed = parseResolverInvocationParams(rawKey, parentData, context, signal);
      const isKey = isValidSchemaKey(definition, parsed.key);
      validateSchemaKey(isKey, parsed.key);
      if (isValidSchemaKey(definition, parsed.key)) {
        const node = definition[parsed.key];
        if (node && typeof node.resolver === 'function') {
          return Promise.resolve(
            node.resolver(parsed.key, parsed.parentData, parsed.context, parsed.signal),
          ) as Promise<SchemaData<TSchema, SchemaKeys<TSchema>>>;
        }
      }
      return Promise.reject(new Error(`No schema resolver defined for key: "${parsed.key}"`));
    };
  };

  return {
    definition,
    keys,
    createResolver,
    Trigger: createSchemaTrigger(definition),
    useData: <K extends SchemaKeys<TSchema>>(key: K) =>
      usePopoverData<K, SchemaData<TSchema, K>>(key),
    useEntry: <K extends SchemaKeys<TSchema>>(key: K) =>
      usePopoverEntry<K, SchemaData<TSchema, K>>(key),
    usePopover: <K extends SchemaKeys<TSchema>>(key: K) =>
      usePopover<K, SchemaData<TSchema, K>>(key),
    useBreadcrumbs: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverBreadcrumbs(key),
    useChildren: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverChildrenKeys(key),
    useParent: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverParentKey(key),
    useDepth: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverDepth(key),
    useIsOpen: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverIsOpen(key),
    useIsPinned: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverIsPinned(key),
    useIsTopMost: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverIsTopMost(key),
    useIsLoading: <K extends SchemaKeys<TSchema>>(key: K) => usePopoverIsLoading(key),
    useActions: createSchemaActionsHook<TSchema, TContext>(definition),
    extend: <TExtra extends PopoverSchemaDefinition>(extra: TExtra) =>
      createPopoverSchema({ ...definition, ...extra } as TSchema & TExtra),
  };
}

export { mergePopoverSchemas } from './schemaMerger';
