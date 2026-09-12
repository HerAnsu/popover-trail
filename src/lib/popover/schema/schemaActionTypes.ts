/**
 * Action Types Contract for Popover Schema Engine.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module schema/schemaActionTypes
 */

import type { OpenRootOptions, OpenNestedOptions, AnchorEventLike, TrailEntry } from '../types';
import type {
  PopoverSchemaDefinition,
  SchemaKeys,
  AllowedChildrenOf,
  SchemaData,
} from './schemaTypes';

export interface SchemaActionsHook<TSchema extends PopoverSchemaDefinition> {
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
  close: (key: SchemaKeys<TSchema>, options?: { transition?: boolean }) => void;
  closeAll: () => void;
  togglePin: (key: SchemaKeys<TSchema>, rect?: DOMRect) => void;
  bringToFront: (key: SchemaKeys<TSchema>) => void;
  retryPopover: (key: SchemaKeys<TSchema>) => Promise<void>;
  prefetchPopover: (key: SchemaKeys<TSchema>, parentData?: unknown) => Promise<unknown>;
  invalidate: (keyOrKeys: SchemaKeys<TSchema> | readonly SchemaKeys<TSchema>[]) => Promise<void>;
  subscribeKey: <K extends SchemaKeys<TSchema>>(
    key: K,
    listener: (
      entry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
      prevEntry: TrailEntry<SchemaData<TSchema, K>, K> | undefined,
    ) => void,
  ) => () => void;
  clear: () => void;
}
