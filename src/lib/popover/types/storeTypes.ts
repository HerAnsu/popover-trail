/**
 * Zustand Store Interfaces, Action Signatures, and Middleware types for popover-trail.
 *
 * @module types/storeTypes
 */

import type { VirtualElement } from '@floating-ui/react';
import type {
  TrailEntry,
  PopoverTransitionStatus,
  PopoverEntryDiscriminatedState,
} from './entryTypes';
import type {
  CollisionConfig,
  OpenRootOptions,
  OpenNestedOptions,
  FocusLockOptions,
  ButtonControlConfig,
  PopoverResponsiveMode,
  ZIndexBaseMap,
  PopoverSlotComponents,
  PopoverPersistConfig,
} from './configTypes';
import type { PopoverStoreEvent } from './eventTypes';

import type { StoreApi } from 'zustand/vanilla';
import type { RegisteredKeys, RegisteredDataMap } from './registerTypes';
import type { Brand, PopoverKey, ParentKey, StackGroupId, ZIndexDepth } from './branded';
export type { Brand, PopoverKey, ParentKey, StackGroupId, ZIndexDepth };

export type ViewportX = Brand<number, 'ViewportX'>;
export type ViewportY = Brand<number, 'ViewportY'>;
export type OwnerId = Brand<string, 'OwnerId'>;
export type TabId = Brand<string, 'TabId'>;
export type DragOffset = { x: number; y: number };

/** Discriminated union representation of all state-modifying actions in popover-trail. */
export type StoreActionPayload<TData = unknown, TContext = unknown> =
  | { type: 'OPEN_ROOT'; key: string; rect?: DOMRect | null; options?: OpenRootOptions }
  | { type: 'PUSH_NESTED'; key: string; parentKey: string; options?: OpenNestedOptions }
  | { type: 'CLOSE_BY_KEY'; key: string }
  | { type: 'TOGGLE_PIN'; key: string }
  | { type: 'BRING_TO_FRONT'; key: string }
  | { type: 'RESOLVE_SUCCESS'; key: string; data: TData }
  | { type: 'RESOLVE_ERROR'; key: string; error: Error }
  | { type: 'SET_CONTEXT'; context: TContext }
  | { type: 'RESET' };

/** Alias type for PopoverStore state. */
export type StoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStore<TData, TContext, TPopoverKey>;

/** Partial patch type for PopoverStore updates. */
export type StatePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<StoreState<TData, TContext, TPopoverKey>>;

/** Utility type extracting data-only reactive properties from store state (excluding methods). */
export type OnlyDataState<TState> = Omit<
  TState,
  'actions' | 'batchUpdates' | 'destroy' | 'setState' | 'getState' | 'subscribe'
>;

/** Store state setter callback type matching Zustand vanilla store API. */
export type StoreSetFn<TData = unknown, TContext = unknown> = (
  partial:
    | Partial<PopoverStore<TData, TContext>>
    | ((state: PopoverStore<TData, TContext>) => Partial<PopoverStore<TData, TContext>>),
  replace?: boolean,
) => void;

/** Store state getter callback type matching Zustand vanilla store API. */
export type StoreGetFn<TData = unknown, TContext = unknown> = () => PopoverStore<TData, TContext>;

/** Standard contract type for domain slice factory functions. */
export type StoreSliceCreator<TSlice, TData = unknown, TContext = unknown> = (
  set: StoreSetFn<TData, TContext>,
  get: StoreGetFn<TData, TContext>,
) => TSlice;

/**
 * Strongly typed store API wrapper bound to registered schema definitions.
 * Provides IDE autocompletion for registered popover keys and inferred payloads.
 */
export interface TypedPopoverStoreApi<
  TData = RegisteredDataMap[RegisteredKeys],
  TContext = unknown,
  TPopoverKey extends string = RegisteredKeys,
> extends Omit<StoreApi<PopoverStore<TData, TContext, TPopoverKey>>, 'getState' | 'setState'> {
  getState: () => PopoverStore<TData, TContext, TPopoverKey>;
  setState: (
    partial:
      | StatePatch<TData, TContext, TPopoverKey>
      | ((
          state: PopoverStore<TData, TContext, TPopoverKey>,
        ) => StatePatch<TData, TContext, TPopoverKey>),
    replace?: boolean,
  ) => void;
}

/**
 * Formal contract descriptor for modular store domain slices.
 *
 * @template TSlice - Shape of domain slice actions and properties.
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 */
export interface StoreSliceDescriptor<TSlice, TData = unknown, TContext = unknown> {
  /** Name identifier of the slice domain module. */
  readonly name: string;
  /** Factory function instantiating slice actions bound to slice context container. */
  readonly create: (
    ctx: import('../store/slices/sliceContext').SliceContext<TData, TContext>,
  ) => TSlice;
}

/** Helper function defining a strongly typed domain store slice descriptor. */
export function defineStoreSlice<TSlice, TData = unknown, TContext = unknown>(
  descriptor: StoreSliceDescriptor<TSlice, TData, TContext>,
): StoreSliceDescriptor<TSlice, TData, TContext> {
  return descriptor;
}

/** Helper type recursively applying readonly modifier to all properties and nested objects. */
export type ReadonlyDeep<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? { readonly [P in keyof T]: ReadonlyDeep<T[P]> }
    : T;

/** Domain-scoped template literal type for namespaced popover keys (e.g. 'user:profile'). */
export type DomainPopoverKey<
  TDomain extends string = string,
  TName extends string = string,
> = `${TDomain}:${TName}`;

/**
 * A minimal event-like or element-like object accepted by `openRootWithResolver`
 * as the anchor source. Supports Floating UI VirtualElement, React synthetic events, or raw DOM elements.
 */
export type AnchorEventLike =
  | VirtualElement
  | { currentTarget: HTMLElement; stopPropagation?: () => void }
  | { getBoundingClientRect: () => DOMRect; stopPropagation?: () => void };

/**
 * Nominal interface representing a validated positioning anchor ref with guaranteed geometry bounds.
 */
export interface ValidatedAnchorRef {
  readonly getBoundingClientRect: () => DOMRect;
  readonly currentTarget?: HTMLElement;
}

/**
 * Resolver callback type for lazy-loading/hydrating data for a popover card.
 */
export type PopoverResolver<TData = unknown, TContext = unknown> = (
  keyOrName: string,
  parentData?: TData,
  context?: TContext,
  signal?: AbortSignal,
) => Promise<TData> | TData;

export type InferResolverData<T> = T extends PopoverResolver<infer D, unknown> ? D : unknown;

/**
 * Parameter object provided to cancellable async resolvers, guaranteeing a non-optional AbortSignal.
 */
export interface ResolverParams<TParentData = unknown, TContext = unknown> {
  key: string;
  parentData?: TParentData;
  context?: TContext;
  signal: AbortSignal;
}

/**
 * Strict cancellable resolver callback accepting a single parameter object with non-optional AbortSignal.
 */
export type CancellablePopoverResolver<
  TData = unknown,
  TParentData = unknown,
  TContext = unknown,
> = (params: ResolverParams<TParentData, TContext>) => Promise<TData> | TData;

/**
 * Custom popover cache provider interface.
 */
export interface PopoverCache<TData = unknown> {
  get: (key: string) => TData | Promise<TData> | undefined;
  set: (key: string, value: TData, ttlMs?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean | void;
  clear: () => void;
  destroy?: () => void;
}

/**
 * The inner reactive state managed by the popover Zustand store.
 */
export interface PopoverStateData<TData = unknown, TContext = unknown> {
  readonly stateRevision: number;
  readonly trail: readonly TrailEntry<TData>[];
  readonly floating: readonly TrailEntry<TData>[];
  readonly ownerId: string | null;
  readonly offsets: Readonly<Record<string, Readonly<DragOffset>>>;
  readonly pinnedStates: Readonly<Record<string, boolean>>;
  readonly zIndexOrder: readonly string[];
  readonly rootHydrationRequestCounter: number;
  readonly nestedHydrationRequestCounters: Readonly<Record<string, number>>;
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
  readonly exitTransitionDuration: number;
  readonly defaultOffset: number;
  readonly baseZIndex: number;
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

/** Discriminated idle state when no popovers are open in trail or floating. */
export type IdleStoreState<TData = unknown, TContext = unknown> = PopoverStateData<
  TData,
  TContext
> & {
  readonly status: 'idle';
  readonly trail: readonly [];
  readonly floating: readonly [];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

/** Discriminated active state when at least one popover is active in the trail. */
export type ActiveTrailStoreState<TData = unknown, TContext = unknown> = PopoverStateData<
  TData,
  TContext
> & {
  readonly status: 'active-trail';
  readonly trail: readonly [TrailEntry<TData>, ...TrailEntry<TData>[]];
  readonly anchorElement: HTMLElement;
  readonly anchorRect: DOMRect;
  readonly ownerId: string;
};

/** Discriminated pinned-only state when only pinned/floating popovers are active. */
export type PinnedOnlyStoreState<TData = unknown, TContext = unknown> = PopoverStateData<
  TData,
  TContext
> & {
  readonly status: 'pinned-only';
  readonly trail: readonly [];
  readonly floating: readonly [TrailEntry<TData>, ...TrailEntry<TData>[]];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

/** Comprehensive Discriminated Union representing all possible runtime states of the popover store. */
export type PopoverStoreDiscriminatedState<TData = unknown, TContext = unknown> =
  | IdleStoreState<TData, TContext>
  | ActiveTrailStoreState<TData, TContext>
  | PinnedOnlyStoreState<TData, TContext>;

/** Strongly typed state patch payload passed to store middleware interceptors. */
export type TypedMiddlewarePatch<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
> = Partial<PopoverStateData<TData, TContext>> & {
  targetKey?: string;
};

/**
 * Middleware function intercepting state updates before commit.
 */
export type PopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  _TPopoverKey extends string = string,
> = (
  patch: TypedMiddlewarePatch<TData, TContext, _TPopoverKey>,
  state: PopoverStateData<TData, TContext>,
) => TypedMiddlewarePatch<TData, TContext, _TPopoverKey> | false | void;

/**
 * The dispatch and lifecycle actions exposed by the popover store.
 */
export interface PopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  setContext: (context: TContext) => void;
  setResolveData: (resolver: PopoverResolver<TData, TContext>) => void;
  setOwnerId: (ownerId: string | null) => void;
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  pushNested: (index: number, entry: TrailEntry<TData>) => void;
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;
  bringToFront: (key: TPopoverKey) => void;
  closeFrom: (index: number, options?: { transition?: boolean }) => void;
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;
  clear: () => void;
  closeAll: () => void;
  clearTrail: () => void;
  closeTopmost: (options?: { transition?: boolean }) => void;
  openRootWithResolver: (
    keyOrName: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ) => Promise<void>;
  openNestedWithResolver: (
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
  ) => Promise<void>;
  retryPopover: (key: TPopoverKey) => Promise<void>;
  prefetchPopover: (key: TPopoverKey, parentData?: TData) => Promise<TData | undefined>;
  destroy: () => void;
  setClosePinnedDescendants: (close: boolean) => void;
  setCollisionConfig: (config: CollisionConfig | null) => void;
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  setEnableArrowNavigation: (enable: boolean) => void;
  setDebug: (debug: boolean) => void;
  hoverEnter: (key: TPopoverKey) => void;
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
  setCascadeOffsetStep: (step: number) => void;
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
  setExitTransitionDuration: (duration: number) => void;
  setDefaultOffset: (offset: number) => void;
  setBaseZIndex: (baseZIndex: number) => void;
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;
  setAllowDragWhenPinned: (allow: boolean) => void;
  setAllowDragWhenUnpinned: (allow: boolean) => void;
  setMobileBreakpoint: (breakpoint: number) => void;
  setFocusLockOptions: (options: FocusLockOptions | null) => void;
  subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => () => void;
  batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  useMiddleware: (middleware: PopoverMiddleware<TData, TContext, TPopoverKey>) => () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  transaction: (
    fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
  ) => Promise<boolean>;
  persistState: (config?: PopoverPersistConfig) => Promise<void>;
  rehydrateState: (config?: PopoverPersistConfig) => Promise<boolean>;
  setButtonControls: (key: TPopoverKey, controls: ButtonControlConfig) => void;
  toggleButtonControl: (
    key: TPopoverKey,
    control: 'enablePin' | 'enableClose' | 'enableDrag',
    enabled?: boolean,
  ) => void;
  setStackGroupFilter: (group: string | null) => void;
  setResponsiveMode: (mode: PopoverResponsiveMode) => void;
  setZIndexBaseMap: (map: ZIndexBaseMap | null) => void;
  setSlotComponents: (components: PopoverSlotComponents | null) => void;
}

/**
 * Result object returned by the unified `usePopover` hook.
 */
export interface UsePopoverResult<TData = unknown> {
  entry: TrailEntry<TData> | undefined;
  state: PopoverEntryDiscriminatedState<TData>;
  isOpen: boolean;
  isPinned: boolean;
  zIndex: number;
  isTop: boolean;
  offset: DragOffset;
  isLoading: boolean;
  data: TData | null | undefined;
  error: Error | null | undefined;
  close: () => void;
  pin: (rect: DOMRect) => void;
  bringToFront: () => void;
  updateOffset: (x: number, y: number) => void;
}

/**
 * The complete Zustand store type combining state data and action dispatchers.
 */
export type PopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext, TPopoverKey> & {
    actions: PopoverActions<TData, TContext, TPopoverKey>;
  };
