/**
 * Schema-typed Actions Hook Factory for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaActions
 */

import { useMemo } from 'react';
import { usePopoverActions } from '../context/usePopoverStore';
import { validateSchemaKey } from '../validators';
import type { OpenRootOptions, OpenNestedOptions, AnchorEventLike, TrailEntry } from '../types';
import type {
  PopoverSchemaDefinition,
  SchemaKeys,
  AllowedChildrenOf,
  SchemaData,
} from './schemaTypes';
import type { SchemaActionsHook } from './schemaActionTypes';
import { mergeSchemaNodeOptions } from './schemaParams';

/**
 * Factory creating a React hook (`useActions`) bound to a specific popover schema definition.
 *
 * @template TSchema - Popover schema definition type.
 * @template TContext - Ambient context type.
 * @param definition - Popover schema definition object.
 * @returns React hook returning strongly typed schema actions (`openRoot`, `pushNested`, `close`, etc.).
 *
 * @example
 * ```typescript
 * const useActions = createSchemaActionsHook(schemaDefinition);
 *
 * function MyComponent() {
 *   const actions = useActions();
 *   return <button onClick={(e) => actions.openRoot('user', e)}>Open</button>;
 * }
 * ```
 */
export function createSchemaActionsHook<
  TSchema extends PopoverSchemaDefinition,
  TContext = unknown,
>(definition: TSchema): () => SchemaActionsHook<TSchema> {
  return function useActions(): SchemaActionsHook<TSchema> {
    const actions = usePopoverActions<unknown, TContext, SchemaKeys<TSchema>>();
    const {
      openRootWithResolver,
      openNestedWithResolver,
      closeByKey,
      closeAll,
      togglePin,
      bringToFront,
      retryPopover,
      prefetchPopover,
      invalidate,
      subscribeKey,
      clear,
    } = actions;

    return useMemo(
      () => ({
        openRoot: <K extends SchemaKeys<TSchema>>(
          key: K,
          anchorEvent: AnchorEventLike,
          options?: OpenRootOptions,
        ) => {
          const node = definition[key];
          validateSchemaKey(Boolean(node), String(key));
          return openRootWithResolver(
            key,
            anchorEvent,
            mergeSchemaNodeOptions(node, options),
          );
        },
        pushNested: <SK extends SchemaKeys<TSchema>>(
          key: AllowedChildrenOf<TSchema, SK>,
          sourceKey: SK,
          options?: OpenNestedOptions,
        ) => {
          const strKey = String(key);
          const node = definition[strKey];
          validateSchemaKey(Boolean(node), strKey);
          return openNestedWithResolver(
            key,
            sourceKey,
            mergeSchemaNodeOptions(node, options),
          );
        },
        close: (key: SchemaKeys<TSchema>, options?: { transition?: boolean }) =>
          closeByKey(key, options),
        closeAll: () => closeAll(),
        togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => togglePin(key, rect),
        bringToFront: (key: SchemaKeys<TSchema>) => bringToFront(key),
        retryPopover: (key: SchemaKeys<TSchema>) => retryPopover(key),
        prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) =>
          prefetchPopover(key, parentData),
        invalidate: (keyOrKeys: SchemaKeys<TSchema> | readonly SchemaKeys<TSchema>[]) =>
          invalidate(keyOrKeys),
        subscribeKey: <K extends SchemaKeys<TSchema>>(
          key: K,
          listener: (
            entry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
            prevEntry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
          ) => void,
        ) => subscribeKey<K, SchemaData<TSchema, K>>(key, listener),
        clear: () => clear(),
      }),
      [
        openRootWithResolver,
        openNestedWithResolver,
        closeByKey,
        closeAll,
        togglePin,
        bringToFront,
        retryPopover,
        prefetchPopover,
        invalidate,
        subscribeKey,
        clear,
      ],
    );
  };
}
