/**
 * State Taxonomy Matrix and Reactive Snapshot Definitions for popover-trail.
 * Clean Architecture Layer 2: Headless State Management & Orchestration.
 *
 * | Role Interface    | Scope                                          |
 * | ----------------- | ---------------------------------------------- |
 * | `PopoverStateData`| Immutable reactive state snapshot (pure data). |
 * | `StoreState`      | Alias to PopoverStore for backward-compat.     |
 * | `PopoverStore`    | Full Zustand store with action dispatchers.    |
 *
 * @module types/state/taxonomy
 */

import type { VirtualElement } from '@floating-ui/react';
import type { TrailEntry } from '../entryTypes';
import type { DragOffset } from '../geometry';
import type {
  CollisionConfig,
  FocusLockOptions,
  PopoverResponsiveMode,
  ZIndexBaseMap,
  PopoverSlotComponents,
} from '../configTypes';
import type { StackGroupId, OwnerId, DurationMs, ZIndexDepth } from '../branded';
import type { PopoverStore } from '../selectorTypes';
import type { PopoverCache, PopoverResolver } from './resolvers';

export interface PopoverStateData<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  readonly stateRevision: number;
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  readonly ownerId: OwnerId | string | null;
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  readonly zIndexOrder: readonly TPopoverKey[];
  readonly rootHydrationRequestCounter: number;
  readonly nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
  readonly anchorElement: HTMLElement | null;
  readonly anchorRect: DOMRect | null;
  readonly context: TContext | null;
  readonly closePinnedDescendants: boolean;
  readonly collisionConfig: CollisionConfig | null;
  readonly cache: PopoverCache<TData> | null;
  readonly resolveData: PopoverResolver<TData, TContext>;
  readonly enableArrowNavigation: boolean;
  readonly debug: boolean;
  readonly cascadeOffsetStep: number;
  readonly exitTransitionDuration: DurationMs | number;
  readonly defaultOffset: number;
  readonly baseZIndex: ZIndexDepth | number;
  readonly mountingClassName: string;
  readonly unmountingClassName: string;
  readonly mountedClassName: string;
  readonly activeStackGroup: StackGroupId | string | null;
  readonly responsiveMode: PopoverResponsiveMode;
  readonly mobileBreakpoint: number;
  readonly components: PopoverSlotComponents | null;
  readonly zIndexBaseMap: ZIndexBaseMap | null;
  readonly allowDragWhenPinned?: boolean;
  readonly allowDragWhenUnpinned?: boolean;
  readonly focusLockOptions?: FocusLockOptions | null;
}

export type AnchorEventLike =
  | VirtualElement
  | { readonly currentTarget: HTMLElement; readonly stopPropagation?: () => void }
  | { readonly getBoundingClientRect: () => DOMRect; readonly stopPropagation?: () => void };

export interface ValidatedAnchorRef {
  readonly getBoundingClientRect: () => DOMRect;
  readonly currentTarget?: HTMLElement;
}

export type StoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStore<TData, TContext, TPopoverKey>;

export type StatePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<StoreState<TData, TContext, TPopoverKey>>;
