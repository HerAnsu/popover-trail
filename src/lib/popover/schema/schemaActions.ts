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

export function createSchemaActionsHook<
  TSchema extends PopoverSchemaDefinition,
  TContext = unknown,
>(definition: TSchema): () => SchemaActionsHook<TSchema> {
  return function useActions(): SchemaActionsHook<TSchema> {
    const actions = usePopoverActions<unknown, TContext, SchemaKeys<TSchema>>();

    return useMemo(
      () => ({
        openRoot: <K extends SchemaKeys<TSchema>>(
          key: K,
          anchorEvent: AnchorEventLike,
          options?: OpenRootOptions,
        ) => {
          const node = definition[key];
          validateSchemaKey(Boolean(node), String(key));
          return actions.openRootWithResolver(
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
          return actions.openNestedWithResolver(
            key,
            sourceKey,
            mergeSchemaNodeOptions(node, options),
          );
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
          actions.invalidate(keyOrKeys),
        subscribeKey: <K extends SchemaKeys<TSchema>>(
          key: K,
          listener: (
            entry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
            prevEntry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
          ) => void,
        ) => actions.subscribeKey<K, SchemaData<TSchema, K>>(key, listener),
        clear: () => actions.clear(),
      }),
      [actions],
    );
  };
}
