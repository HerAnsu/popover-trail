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
 *
 * @remarks
 * Contains immutable state slices for active trailing cards (`trail`), detached floating windows (`floating`),
 * coordinate offsets (`offsets`), pinning map (`pinnedStates`), topological z-index depth order (`zIndexOrder`),
 * request race guards (`rootHydrationRequestCounter`, `nestedHydrationRequestCounters`), and responsive configuration.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 */
export interface PopoverStateData<TData = unknown, TContext = unknown> {
  /** Incremental state revision number bumped on each committed state patch. */
  readonly stateRevision: number;
  /** Active cascade trail stack of cards, ordered from root (index 0) to leaf child. */
  readonly trail: readonly TrailEntry<TData>[];
  /** Detached floating/pinned popover cards independent of the cascade trail. */
  readonly floating: readonly TrailEntry<TData>[];
  /** Owner ID string identifying the trigger that initiated the root popover. */
  readonly ownerId: string | null;
  /** Drag coordinate offsets (x, y) in pixels mapped by popover key. */
  readonly offsets: Readonly<Record<string, Readonly<DragOffset>>>;
  /** Record mapping popover keys to boolean pinned status. */
  readonly pinnedStates: Readonly<Record<string, boolean>>;
  /** Ordered list of active popover keys sorted from bottom to top z-index depth. */
  readonly zIndexOrder: readonly string[];
  /** Incremental counter for root hydration requests preventing async race conditions. */
  readonly rootHydrationRequestCounter: number;
  /** Incremental counters for nested child hydration requests mapped by parent key. */
  readonly nestedHydrationRequestCounters: Readonly<Record<string, number>>;
  /** Currently focused anchor element in the DOM. */
  readonly anchorElement: HTMLElement | null;
  /** Bounding rectangle of the primary anchor. */
  readonly anchorRect: DOMRect | null;
  /** Global application context value passed to data resolvers. */
  readonly context: TContext | null;
  /** When true, closing a parent card also closes its detached pinned descendants. */
  readonly closePinnedDescendants: boolean;
  /** Global collision avoidance settings. */
  readonly collisionConfig: CollisionConfig | null;
  /** Global cache provider instance. */
  readonly cache: PopoverCache<TData> | null;
  /** Data resolution callback function. */
  readonly resolveData: PopoverResolver<TData, TContext>;
  /** When true, allows keyboard arrow key navigation across open cards. */
  readonly enableArrowNavigation: boolean;
  /** Development mode debug flag enabling verbose logging. */
  readonly debug: boolean;
  /** Pixel offset step distance between successive cards in the cascade. */
  readonly cascadeOffsetStep: number;
  /** Exit transition duration in milliseconds. */
  readonly exitTransitionDuration: number;
  /** Default placement offset distance in pixels from trigger. */
  readonly defaultOffset: number;
  /** Base starting z-index for the portal layer. */
  readonly baseZIndex: number;
  /** CSS class name applied during mounting transition. */
  readonly mountingClassName: string;
  /** CSS class name applied during unmounting exit transition. */
  readonly unmountingClassName: string;
  /** CSS class name applied when fully mounted. */
  readonly mountedClassName: string;
  /** Active stack group filter identifier if set. */
  readonly activeStackGroup: StackGroupId | string | null;
  /** Responsive mode override ('auto', 'modal', 'bottom-sheet', 'docked-top', 'docked-bottom'). */
  readonly responsiveMode: PopoverResponsiveMode;
  /** Viewport width in pixels below which mobile responsive mode activates. */
  readonly mobileBreakpoint: number;
  /** Custom slot replacement components. */
  readonly components: PopoverSlotComponents | null;
  /** Custom base z-index overrides mapped by popover key. */
  readonly zIndexBaseMap: ZIndexBaseMap | null;
  /** Allows dragging cards when pinned (defaults to true). */
  readonly allowDragWhenPinned?: boolean;
  /** Allows dragging cards when in trailing mode (defaults to true). */
  readonly allowDragWhenUnpinned?: boolean;
  /** Focus trapping configuration options for accessibility. */
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
 * Public action dispatchers and lifecycle management methods exposed by the popover store.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Updates the global shared context object. */
  setContext: (context: TContext) => void;
  /** Replaces the active data resolver function. */
  setResolveData: (resolver: PopoverResolver<TData, TContext>) => void;
  /** Sets the current root owner identifier. */
  setOwnerId: (ownerId: string | null) => void;
  /** Synchronously pushes a root popover entry into the trail stack. */
  openRoot: (ownerId: string, entry: TrailEntry<TData>) => void;
  /** Synchronously pushes a nested child entry attached at parent index. */
  pushNested: (index: number, entry: TrailEntry<TData>) => void;
  /** Toggles the pinned/floating status of a popover card. */
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;
  /** Elevates a popover card to the top of the z-index depth order. */
  bringToFront: (key: TPopoverKey) => void;
  /** Closes all popovers starting from a specific trail index. */
  closeFrom: (index: number, options?: { transition?: boolean }) => void;
  /** Updates the drag coordinate offset for a popover card. */
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;
  /** Clears all popover cards (both trailing cascade and pinned floating windows). */
  clear: () => void;
  /** Alias for clear(). Closes all active popovers. */
  closeAll: () => void;
  /** Clears only trailing cascade cards, leaving detached pinned windows open. */
  clearTrail: () => void;
  /** Closes the topmost active popover card. */
  closeTopmost: (options?: { transition?: boolean }) => void;
  /**
   * Opens a root popover card and executes the data resolution pipeline.
   *
   * @param keyOrName - Target popover key.
   * @param anchorEvent - Optional trigger event, DOM element, or virtual anchor coordinates.
   * @param options - Custom configuration options (placement, collision, delays).
   */
  openRootWithResolver: (
    keyOrName: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ) => Promise<void>;
  /**
   * Opens a nested child popover card and links it to the parent in the DAG.
   *
   * @param keyOrName - Target child popover key.
   * @param sourceKey - Parent popover key spawning this child.
   * @param options - Custom configuration options (placement, triggerRect).
   */
  openNestedWithResolver: (
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
  ) => Promise<void>;
  /** Retries async data resolution for a popover currently in an error state. */
  retryPopover: (key: TPopoverKey) => Promise<void>;
  /** Eagerly resolves and caches data for a popover before user interaction. */
  prefetchPopover: (key: TPopoverKey, parentData?: TData) => Promise<TData | undefined>;
  /** Cleans up store resources, aborts active requests, and clears timers. */
  destroy: () => void;
  /** Configures whether closing a parent also closes pinned descendants. */
  setClosePinnedDescendants: (close: boolean) => void;
  /** Configures global collision avoidance parameters. */
  setCollisionConfig: (config: CollisionConfig | null) => void;
  /** Closes a specific popover card by its unique key. */
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  /** Enables or disables keyboard arrow key navigation across open cards. */
  setEnableArrowNavigation: (enable: boolean) => void;
  /** Enables or disables development mode debug logging. */
  setDebug: (debug: boolean) => void;
  /** Handles pointer hover enter event on a trigger or card. */
  hoverEnter: (key: TPopoverKey) => void;
  /** Handles pointer hover leave with exit debounce delay. */
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
  /** Configures the pixel offset distance between cascading cards. */
  setCascadeOffsetStep: (step: number) => void;
  /** Updates the transition lifecycle status of a card ('mounting' | 'mounted' | 'unmounting'). */
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
  /** Configures exit transition duration in milliseconds. */
  setExitTransitionDuration: (duration: number) => void;
  /** Configures default placement offset distance in pixels. */
  setDefaultOffset: (offset: number) => void;
  /** Configures base starting z-index for the portal layer. */
  setBaseZIndex: (baseZIndex: number) => void;
  /** Configures global animation CSS class names. */
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;
  /** Configures whether pinned cards can be dragged. */
  setAllowDragWhenPinned: (allow: boolean) => void;
  /** Configures whether unpinned cascading cards can be dragged. */
  setAllowDragWhenUnpinned: (allow: boolean) => void;
  /** Configures mobile viewport breakpoint width in pixels. */
  setMobileBreakpoint: (breakpoint: number) => void;
  /** Configures focus lock options for modal accessibility. */
  setFocusLockOptions: (options: FocusLockOptions | null) => void;
  /** Subscribes a listener to raw store lifecycle events. */
  subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => () => void;
  /** Executes multiple actions within an atomic batch update scope. */
  batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  /** Registers a middleware function to intercept state updates. */
  useMiddleware: (middleware: PopoverMiddleware<TData, TContext, TPopoverKey>) => () => void;
  /** Reverts to the previous state snapshot in the undo history stack. */
  undo: () => void;
  /** Re-applies the next state snapshot in the redo history stack. */
  redo: () => void;
  /** True if previous snapshots exist for undo. */
  canUndo: () => boolean;
  /** True if forward snapshots exist for redo. */
  canRedo: () => boolean;
  /** Executes an atomic transaction that rolls back on thrown errors. */
  transaction: (
    fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
  ) => Promise<boolean>;
  /** Serializes and saves the active popover state snapshot to localStorage. */
  persistState: (config?: PopoverPersistConfig) => Promise<void>;
  /** Restores saved popover state from localStorage. */
  rehydrateState: (config?: PopoverPersistConfig) => Promise<boolean>;
  /** Configures visible button controls (pin, close, drag) for a card. */
  setButtonControls: (key: TPopoverKey, controls: ButtonControlConfig) => void;
  /** Toggles a specific button control on a card. */
  toggleButtonControl: (
    key: TPopoverKey,
    control: 'enablePin' | 'enableClose' | 'enableDrag',
    enabled?: boolean,
  ) => void;
  /** Filters the active stack by group identifier. */
  setStackGroupFilter: (group: string | null) => void;
  /** Configures responsive layout mode overrides. */
  setResponsiveMode: (mode: PopoverResponsiveMode) => void;
  /** Configures custom base z-index values by key. */
  setZIndexBaseMap: (map: ZIndexBaseMap | null) => void;
  /** Configures custom slot replacement components. */
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
 * The complete Zustand store type combining state data properties and action dispatchers.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global shared context type.
 * @template TPopoverKey - Union of valid popover keys.
 */
export type PopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext> &
  PopoverActions<TData, TContext, TPopoverKey> & {
    actions: PopoverActions<TData, TContext, TPopoverKey>;
  };
