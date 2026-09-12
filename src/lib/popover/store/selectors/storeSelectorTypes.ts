/**
 * Minimal State Slice Interfaces for Contravariant Query Selectors.
 *
 * @module storeSelectorTypes
 */

import type { TrailEntry, DragOffset } from '../../types';

export interface HasActiveEntriesState<TData = unknown, TPopoverKey extends string = string> {
  floating: readonly TrailEntry<TData, TPopoverKey>[];
  trail: readonly TrailEntry<TData, TPopoverKey>[];
}

export interface HasOffsetsState<TPopoverKey extends string = string> {
  offsets:
    | Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>
    | Record<string, DragOffset>;
}

export interface HasPinnedStates<TPopoverKey extends string = string> {
  pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>> | Record<string, boolean>;
}

export interface HasZIndexState<TPopoverKey extends string = string> {
  zIndexOrder: readonly TPopoverKey[];
}

export interface HasStatusState<
  TData = unknown,
  TPopoverKey extends string = string,
> extends HasActiveEntriesState<TData, TPopoverKey> {}
