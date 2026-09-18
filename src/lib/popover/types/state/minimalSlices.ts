/**
 * Minimal Slice Contracts for popover-trail store subsystems.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * @module types/state/minimalSlices
 */

import type { TrailEntry } from '../entryTypes';
import type { DragOffset } from '../geometry';

export interface HasTrailState<TData = unknown, TPopoverKey extends string = string> {
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  readonly ownerId: string | null;
}

export interface HasFloatingState<TData = unknown, TPopoverKey extends string = string> {
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
}

export interface HasPinnedState<TPopoverKey extends string = string> {
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
}

export interface HasZIndexState<TPopoverKey extends string = string> {
  readonly zIndexOrder: readonly TPopoverKey[];
  readonly baseZIndex: number;
}

export interface HasLifecycleState<TPopoverKey extends string = string> {
  readonly rootHydrationRequestCounter: number;
  readonly nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
  readonly mountingClassName: string;
  readonly unmountingClassName: string;
  readonly mountedClassName: string;
}

export interface HasAnchorState {
  readonly anchorElement: HTMLElement | null;
  readonly anchorRect: DOMRect | null;
}
