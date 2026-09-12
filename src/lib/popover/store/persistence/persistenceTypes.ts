/**
 * Types & Schema Contracts for Popover Trail Persistence.
 *
 * @module store/persistence/persistenceTypes
 */

import type { DragOffset, TrailEntry, OwnerId, Unbrand } from '../../types';
import type { DISPOSE_SYMBOL } from '../../utils/disposable';

export const CURRENT_SCHEMA_VERSION = 1;

export type PlatformStorageType = 'localStorage' | 'sessionStorage';

export interface PersistedEnvelope<TData = unknown, TPopoverKey extends string = string> {
  readonly schemaVersion: number;
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly zIndexOrder: readonly TPopoverKey[];
  readonly ownerId: Unbrand<OwnerId> | null;
}



export interface CrossTabBroadcaster {
  postMessage(message: unknown): void;
  onMessage(listener: (message: unknown) => void): () => void;
  dispose(): void;
  [DISPOSE_SYMBOL](): void;
}
