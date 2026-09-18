/**
 * Minimal State Slice Interfaces for Contravariant Query Selectors.
 *
 * @module storeSelectorTypes
 */

import type { TrailEntry, DragOffset } from '../../types';

/**
 * Structural slice interface requiring active floating and cascading trail entry arrays.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface HasActiveEntriesState<TData = unknown, TPopoverKey extends string = string> {
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
}

/**
 * Structural slice interface requiring the mapping of popover keys to 2D drag offsets.
 *
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface HasOffsetsState<TPopoverKey extends string = string> {
  readonly offsets:
    | Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>
    | Record<string, DragOffset>;
}

/**
 * Structural slice interface requiring the mapping of popover keys to boolean pinned states.
 *
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface HasPinnedStates<TPopoverKey extends string = string> {
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>> | Record<string, boolean>;
}

/**
 * Structural slice interface requiring visual stacking z-index order keys.
 *
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface HasZIndexState<TPopoverKey extends string = string> {
  readonly zIndexOrder: readonly TPopoverKey[];
}

/**
 * Structural slice interface for selectors computing high-level store lifecycle status.
 *
 * @template TData - Popover payload data type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface HasStatusState<
  TData = unknown,
  TPopoverKey extends string = string,
> extends HasActiveEntriesState<TData, TPopoverKey> {}
