/**
 * Action Signatures for Trail and Cascade Hierarchy Slices.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/actions/trailActions
 */

import type { TrailEntry } from '../entryTypes';
import type { PopoverDAG } from '../../utils/dag';

export interface TrailSliceActions<
  TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
> {
  openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => void;
  pushNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => void;
  pushNestedByKey: (parentKey: TPopoverKey, entry: TrailEntry<TData, TPopoverKey>) => void;
  updateEntry: (key: TPopoverKey, updatedEntry: Partial<TrailEntry<TData, TPopoverKey>>) => void;
  patchEntry: (
    key: TPopoverKey,
    updater: (entry: TrailEntry<TData, TPopoverKey>) => TrailEntry<TData, TPopoverKey>,
  ) => void;
  setTrail: (
    entriesOrUpdater:
      | readonly TrailEntry<TData, TPopoverKey>[]
      | ((
          prev: readonly TrailEntry<TData, TPopoverKey>[],
        ) => readonly TrailEntry<TData, TPopoverKey>[]),
  ) => void;
  setFloating: (
    entriesOrUpdater:
      | readonly TrailEntry<TData, TPopoverKey>[]
      | ((
          prev: readonly TrailEntry<TData, TPopoverKey>[],
        ) => readonly TrailEntry<TData, TPopoverKey>[]),
  ) => void;
  closeFrom: (index: number, options?: { transition?: boolean }) => void;
  close: (options?: { transition?: boolean } | boolean) => void;
  clear: (options?: { transition?: boolean } | boolean) => void;
  closeAll: (options?: { transition?: boolean } | boolean) => void;
  clearTrail: (options?: { transition?: boolean } | boolean) => void;
  closeTopmost: (options?: { transition?: boolean } | boolean) => void;
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  addEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => boolean;
  removeEdge: (parentKey: TPopoverKey, childKey: TPopoverKey) => void;
  getParents: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  getChildren: (key: TPopoverKey) => ReadonlySet<TPopoverKey>;
  getGeodesicPath: (key: TPopoverKey) => readonly TPopoverKey[];
  getDAG: () => PopoverDAG<TPopoverKey> | undefined;
}
