/**
 * Store-Level Provider Configurations and Slot Components for popover-trail.
 * Clean Architecture Layer 1: Core Domain.
 *
 * @module types/config/storeConfig
 */

import type { CollisionConfig } from './collisionConfig';
import type { PopoverDisplayOptions } from './optionsConfig';
import type { ZIndexBaseMap } from './timingConfig';

export interface StateStorageEngine {
  getItem: (key: string) => Promise<string | null> | string | null;
  setItem: (key: string, value: string) => Promise<void> | void;
  removeItem: (key: string) => Promise<void> | void;
  clear?: () => Promise<void> | void;
}

export interface PopoverPersistConfig {
  key?: string;
  storageKey?: string;
  storage?: Storage | StateStorageEngine;
  autoRehydrate?: boolean;
  filter?: (keyOrEntry: unknown, key?: string) => boolean;
  serialize?: (data: unknown) => string;
  deserialize?: (raw: string) => unknown;
}

export interface PopoverSlotComponents {
  PinButton?: React.ComponentType<{ isPinned: boolean; onClick: () => void; keyId: string }>;
  CloseButton?: React.ComponentType<{ onClick: () => void; keyId: string }>;
  LoadingSpinner?: React.ComponentType<{ keyId: string }>;
  ErrorFallback?: React.ComponentType<{ error: Error; onRetry: () => void; keyId: string }>;
}

export interface PopoverConfig<TData = unknown, TContext = unknown> extends PopoverDisplayOptions {
  resolveData?: (
    keyOrName: string,
    parentData?: TData,
    context?: TContext,
    signal?: AbortSignal,
  ) => Promise<TData> | TData;
  initialContext?: TContext;
  closePinnedDescendants?: boolean;
  collisionConfig?: CollisionConfig;
  cache?: unknown;
  mobileBreakpoint?: number;
  components?: PopoverSlotComponents;
  zIndexBaseMap?: ZIndexBaseMap;
  persistConfig?: PopoverPersistConfig;
}
