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
import type { Brand, StackGroupId } from './branded';

export type { Brand, StackGroupId };

export type ViewportX = Brand<number, 'ViewportX'>;
export type ViewportY = Brand<number, 'ViewportY'>;
export type OwnerId = Brand<string, 'OwnerId'>;
export type TabId = Brand<string, 'TabId'>;
export type DragOffset = { x: number; y: number };

/** Default mapped type associating popover keys with uniform TData payloads. */
export type DefaultDataMap<TPopoverKey extends string = string, TData = unknown> = Record<
  TPopoverKey,
  TData
>;

/** Resolves data payload type for a specific key from a schema data map. */
export type ResolveDataFromMap<
  TDataMap,
  K extends string,
  TFallback = unknown,
> = K extends keyof TDataMap ? TDataMap[K] : TFallback;

/** Discriminated union representation of all state-modifying actions in popover-trail. */
export type StoreActionPayload<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> =
  | { type: 'OPEN_ROOT'; key: TPopoverKey; rect?: DOMRect | null; options?: OpenRootOptions }
  | { type: 'PUSH_NESTED'; key: TPopoverKey; parentKey: TPopoverKey; options?: OpenNestedOptions }
  | { type: 'CLOSE_BY_KEY'; key: TPopoverKey; options?: { transition?: boolean } }
  | { type: 'CLOSE_FROM'; index: number; options?: { transition?: boolean } }
  | { type: 'CLOSE_TOPMOST'; options?: { transition?: boolean } }
  | { type: 'CLOSE_ALL' }
  | { type: 'CLEAR_TRAIL' }
  | { type: 'TOGGLE_PIN'; key: TPopoverKey; rect?: DOMRect }
  | { type: 'BRING_TO_FRONT'; key: TPopoverKey }
  | { type: 'UPDATE_OFFSET'; key: TPopoverKey; offset: DragOffset }
  | { type: 'RESOLVE_START'; key: TPopoverKey }
  | { type: 'RESOLVE_SUCCESS'; key: TPopoverKey; data: TData }
  | { type: 'RESOLVE_ERROR'; key: TPopoverKey; error: Error }
  | { type: 'SET_CONTEXT'; context: TContext }
  | { type: 'SET_TRANSITION_STATUS'; key: TPopoverKey; status: PopoverTransitionStatus }
  | { type: 'SET_DEBUG'; debug: boolean }
  | { type: 'SET_BASE_Z_INDEX'; baseZIndex: number }
  | { type: 'SET_CASCADE_OFFSET_STEP'; step: number }
  | { type: 'SET_STACK_GROUP_FILTER'; stackGroup: StackGroupId | string | null }
  | { type: 'SET_RESPONSIVE_MODE'; mode: PopoverResponsiveMode }
  | { type: 'RESET' };

/** Helper extracting action payload structure by action type literal. */
export type ExtractActionPayload<
  TType extends StoreActionPayload['type'],
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Extract<StoreActionPayload<TData, TContext, TPopoverKey>, { type: TType }>;

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
export type StoreSetFn<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = (
  partial:
    | StatePatch<TData, TContext, TPopoverKey>
    | Partial<TSliceState>
    | ((
        state: PopoverStore<TData, TContext, TPopoverKey> & TSliceState,
      ) => StatePatch<TData, TContext, TPopoverKey> | Partial<TSliceState>),
  replace?: boolean,
) => void;

/** Store state getter callback type matching Zustand vanilla store API. */
export type StoreGetFn<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = () => PopoverStore<TData, TContext, TPopoverKey> & TSliceState;

/** Standard contract type for domain slice factory functions. */
export type StoreSliceCreator<
  TSlice,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceState extends object = object,
> = (
  set: StoreSetFn<TData, TContext, TPopoverKey, TSliceState>,
  get: StoreGetFn<TData, TContext, TPopoverKey, TSliceState>,
) => TSlice;

/**
 * Strongly typed store API wrapper bound to registered schema definitions.
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
 * Transforms a union type into an intersection type using contravariant argument position deduction.
 *
 * @template U - Source union type.
 */
export type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (
  k: infer I,
) => void
  ? I
  : never;

/**
 * Formal contract descriptor for modular, extensible store domain slices (Open/Closed Principle).
 *
 * @template TSliceActions - Dictionary type of slice actions.
 * @template TSliceState - Dictionary type of isolated slice state.
 * @template TData - Type of data payload resolved by popover cards.
 * @template TContext - Global application context type.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface StoreSliceDescriptor<
  TSliceActions extends object = object,
  TSliceState extends object = object,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Unique domain name for the slice (e.g., 'analytics', 'workspaceLayout'). */
  readonly name: string;
  /** Optional initial slice state merged immutably into the store state tree during initialization. */
  readonly initialState?: Readonly<TSliceState>;
  /** Action factory function receiving isolated dependency injection context. */
  readonly create: (
    ctx: import('../store/slices/sliceContext').SliceContext<
      TData,
      TContext,
      TPopoverKey,
      TSliceState
    >,
  ) => TSliceActions;
  /** Optional local middleware interceptor attached to the SafeSet pipeline. */
  readonly middleware?: PopoverMiddleware<TData, TContext, TPopoverKey>;
  /** Optional cleanup hook executed when the store is disposed or destroyed. */
  readonly dispose?: (
    ctx: import('../store/slices/sliceContext').SliceContext<
      TData,
      TContext,
      TPopoverKey,
      TSliceState
    >,
  ) => void;
}

/**
 * Type-safe declarative factory function creating a frozen StoreSliceDescriptor with full generic inference.
 *
 * @param descriptor - Slice descriptor configuration object.
 * @returns Frozen immutable slice descriptor.
 */
export function defineStoreSlice<
  TSliceActions extends object,
  TSliceState extends object = object,
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(
  descriptor: StoreSliceDescriptor<TSliceActions, TSliceState, TData, TContext, TPopoverKey>,
): StoreSliceDescriptor<TSliceActions, TSliceState, TData, TContext, TPopoverKey> {
  return Object.freeze(descriptor);
}

/**
 * Computes intersection of all action interfaces from a tuple of slice descriptors.
 *
 * @template TSlices - Tuple of StoreSliceDescriptor instances.
 */
export type InferSliceActionsFromTuple<TSlices> = TSlices extends readonly (infer S)[]
  ? UnionToIntersection<
      S extends StoreSliceDescriptor<
        infer TActions,
        infer _State,
        infer _Data,
        infer _Context,
        infer _Key
      >
        ? TActions
        : object
    >
  : object;

/**
 * Computes intersection of all state interfaces from a tuple of slice descriptors.
 *
 * @template TSlices - Tuple of StoreSliceDescriptor instances.
 */
export type InferSliceStateFromTuple<TSlices> = TSlices extends readonly (infer S)[]
  ? UnionToIntersection<
      S extends StoreSliceDescriptor<
        infer _Actions,
        infer TState,
        infer _Data,
        infer _Context,
        infer _Key
      >
        ? TState
        : object
    >
  : object;

export type ReadonlyDeep<T> = T extends (...args: unknown[]) => unknown
  ? T
  : T extends object
    ? { readonly [P in keyof T]: ReadonlyDeep<T[P]> }
    : T;

export type DomainPopoverKey<
  TDomain extends string = string,
  TName extends string = string,
> = `${TDomain}:${TName}`;

export type AnchorEventLike =
  | VirtualElement
  | { currentTarget: HTMLElement; stopPropagation?: () => void }
  | { getBoundingClientRect: () => DOMRect; stopPropagation?: () => void };

export interface ValidatedAnchorRef {
  readonly getBoundingClientRect: () => DOMRect;
  readonly currentTarget?: HTMLElement;
}

export interface ResolverParams<TParentData = unknown, TContext = unknown> {
  key: string;
  parentData?: TParentData;
  context?: TContext;
  signal: AbortSignal;
}

export type PopoverResolver<TData = unknown, TContext = unknown> = (
  keyOrName: string,
  parentData?: TData,
  context?: TContext,
  signal?: AbortSignal,
) => Promise<TData> | TData;

export type InferResolverData<T> = T extends PopoverResolver<infer D, unknown> ? D : unknown;

export type CancellablePopoverResolver<
  TData = unknown,
  TParentData = unknown,
  TContext = unknown,
> = (params: ResolverParams<TParentData, TContext>) => Promise<TData> | TData;

export interface PopoverCache<TData = unknown> {
  get: (key: string) => TData | Promise<TData> | undefined;
  set: (key: string, value: TData, ttlMs?: number) => void;
  has: (key: string) => boolean;
  delete: (key: string) => boolean | void;
  clear: () => void;
  destroy?: () => void;
}

/**
 * Reactive state snapshot containing active trails, pinned cards, positioning offsets, and store configuration.
 *
 * @template TData - Type of data payload associated with popover entries.
 * @template TContext - Global external context type passed to resolvers and renderers.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface PopoverStateData<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Monotonically increasing revision counter tracking state updates. */
  readonly stateRevision: number;
  /** Active hierarchical cascading trail stack (root at index 0, newest at end). */
  readonly trail: readonly TrailEntry<TData, TPopoverKey>[];
  /** Pinned and detached floating popover entries. */
  readonly floating: readonly TrailEntry<TData, TPopoverKey>[];
  /** Owner / trigger ID of the currently active trail root. */
  readonly ownerId: string | null;
  /** Manual drag/position offsets per popover key. */
  readonly offsets: Readonly<Partial<Record<TPopoverKey, Readonly<DragOffset>>>>;
  /** Lookup map of pinned status per popover key. */
  readonly pinnedStates: Readonly<Partial<Record<TPopoverKey, boolean>>>;
  /** Visual stacking order from bottom to top. */
  readonly zIndexOrder: readonly TPopoverKey[];
  /** Counter tracking root hydration lifecycle triggers. */
  readonly rootHydrationRequestCounter: number;
  /** Counters tracking nested child hydration requests per key. */
  readonly nestedHydrationRequestCounters: Readonly<Partial<Record<TPopoverKey, number>>>;
  /** Active DOM trigger element for root popover positioning. */
  readonly anchorElement: HTMLElement | null;
  /** Cached bounding client rect of the active anchor element. */
  readonly anchorRect: DOMRect | null;
  /** External global application context. */
  readonly context: TContext | null;
  /** Whether to automatically close pinned descendants when parent closes. */
  readonly closePinnedDescendants: boolean;
  /** Collision avoidance configuration settings. */
  readonly collisionConfig: CollisionConfig | null;
  /** Custom data cache provider. */
  readonly cache: PopoverCache<TData> | null;
  /** Async data resolver function. */
  readonly resolveData: PopoverResolver<TData, TContext>;
  /** Whether keyboard arrow key navigation across trail cards is enabled. */
  readonly enableArrowNavigation: boolean;
  /** Whether development debug logging is active. */
  readonly debug: boolean;
  /** Pixel offset step between cascading nested popover cards. */
  readonly cascadeOffsetStep: number;
  /** Exit transition duration in milliseconds. */
  readonly exitTransitionDuration: number;
  /** Default anchor gap offset in pixels. */
  readonly defaultOffset: number;
  /** Base z-index depth for popover layers. */
  readonly baseZIndex: number;
  /** CSS class applied during mount transition. */
  readonly mountingClassName: string;
  /** CSS class applied during unmount transition. */
  readonly unmountingClassName: string;
  /** CSS class applied once fully mounted. */
  readonly mountedClassName: string;
  /** Active stack group filter restricting visible popover cards. */
  readonly activeStackGroup: StackGroupId | string | null;
  /** Responsive layout transformation mode. */
  readonly responsiveMode: PopoverResponsiveMode;
  /** Mobile viewport width breakpoint in pixels. */
  readonly mobileBreakpoint: number;
  /** Custom slot component overrides. */
  readonly components: PopoverSlotComponents | null;
  /** Base z-index lookup map per stack group ID. */
  readonly zIndexBaseMap: ZIndexBaseMap | null;
  /** Whether dragging is permitted on pinned cards. */
  readonly allowDragWhenPinned?: boolean;
  /** Whether dragging is permitted on unpinned trail cards. */
  readonly allowDragWhenUnpinned?: boolean;
  /** WAI-ARIA Focus trapping and accessibility options. */
  readonly focusLockOptions?: FocusLockOptions | null;
}

export type IdleStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'idle';
  readonly trail: readonly [];
  readonly floating: readonly [];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

export type ActiveTrailStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'active-trail';
  readonly trail: readonly [TrailEntry<TData, TPopoverKey>, ...TrailEntry<TData, TPopoverKey>[]];
  readonly anchorElement: HTMLElement;
  readonly anchorRect: DOMRect;
  readonly ownerId: string;
};

export type PinnedOnlyStoreState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = PopoverStateData<TData, TContext, TPopoverKey> & {
  readonly status: 'pinned-only';
  readonly trail: readonly [];
  readonly floating: readonly [TrailEntry<TData, TPopoverKey>, ...TrailEntry<TData, TPopoverKey>[]];
  readonly anchorElement: null;
  readonly anchorRect: null;
  readonly ownerId: null;
};

export type PopoverDataMap<TPopoverKey extends string = string> = Record<TPopoverKey, unknown>;

export type ResolveDataForKey<
  TDataMap extends object,
  K extends string,
  TFallback = unknown,
> = K extends keyof TDataMap ? TDataMap[K] : TFallback;

export type StateSelector<TState, TResult> = (state: TState) => TResult;
export type StateEqualityFn<T> = (a: T, b: T) => boolean;

export type PopoverStoreDiscriminatedState<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> =
  | IdleStoreState<TData, TContext, TPopoverKey>
  | ActiveTrailStoreState<TData, TContext, TPopoverKey>
  | PinnedOnlyStoreState<TData, TContext, TPopoverKey>;

/**
 * Pure type-predicate verifying if the store currently has zero active trailing or floating cards.
 */
export function isStoreIdle<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is IdleStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length === 0 && state.floating.length === 0;
}

/**
 * Pure type-predicate verifying if the store has an active cascade trail path.
 */
export function isStoreActive<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is ActiveTrailStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length > 0;
}

/**
 * Pure type-predicate verifying if the store has only pinned cards without an active cascade trail path.
 */
export function isStorePinnedOnly<TData, TContext, TPopoverKey extends string>(
  state: PopoverStateData<TData, TContext, TPopoverKey>,
): state is PinnedOnlyStoreState<TData, TContext, TPopoverKey> {
  return state.trail.length === 0 && state.floating.length > 0;
}

export type TypedMiddlewarePatch<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = Partial<PopoverStateData<TData, TContext, TPopoverKey>> & {
  targetKey?: TPopoverKey;
};

export type PopoverMiddleware<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> = (
  patch: TypedMiddlewarePatch<TData, TContext, TPopoverKey>,
  state: PopoverStateData<TData, TContext, TPopoverKey>,
) => TypedMiddlewarePatch<TData, TContext, TPopoverKey> | false | void;

/**
 * Full action dispatcher interface for mutating popover trail state, managing history,
 * opening/closing cards, pinning, and configuring runtime options.
 *
 * @template TData - Type of data payload resolved by popover cards.
 * @template TContext - Global external application context.
 * @template TPopoverKey - Union of valid popover string keys.
 */
export interface PopoverActions<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
> {
  /** Updates external application context. */
  setContext: (context: TContext) => void;
  /** Sets or replaces the active async data resolver. */
  setResolveData: (resolver: PopoverResolver<TData, TContext>) => void;
  /** Sets active trail owner ID. */
  setOwnerId: (ownerId: string | null) => void;
  /** Spawns a new root popover card. */
  openRoot: (ownerId: string, entry: TrailEntry<TData, TPopoverKey>) => void;
  /** Pushes a nested child popover card into the cascade trail. */
  pushNested: (index: number, entry: TrailEntry<TData, TPopoverKey>) => void;
  /** Toggles the pinned/floating status of a popover card. */
  togglePin: (key: TPopoverKey, rect?: DOMRect) => void;
  /** Brings a popover card to the front of the visual stacking order. */
  bringToFront: (key: TPopoverKey) => void;
  /** Closes all cards starting from index onward. */
  closeFrom: (index: number, options?: { transition?: boolean }) => void;
  /** Updates drag position offset `(x, y)` for a specific card. */
  updateOffset: (key: TPopoverKey, x: number, y: number) => void;
  /** Closes all active trail and floating popovers. */
  clear: () => void;
  /** Closes all popover cards (alias for clear). */
  closeAll: () => void;
  /** Clears active trail cards while preserving pinned floating cards. */
  clearTrail: (options?: { transition?: boolean }) => void;
  /** Closes the topmost active trail card. */
  closeTopmost: (options?: { transition?: boolean }) => void;
  /** Opens a root popover and executes async data resolution with caching. */
  openRootWithResolver: (
    keyOrName: TPopoverKey,
    anchorEvent?: AnchorEventLike,
    options?: Readonly<OpenRootOptions>,
  ) => Promise<void>;
  /** Opens a child nested popover and executes async data resolution. */
  openNestedWithResolver: (
    keyOrName: TPopoverKey,
    sourceKey: TPopoverKey,
    options?: Readonly<OpenNestedOptions>,
  ) => Promise<void>;
  /** Retries failed data resolution for a specific card. Pass `{ forceRefresh: true }` to retry even while a resolution is still loading. */
  retryPopover: (key: TPopoverKey, options?: Readonly<{ forceRefresh?: boolean }>) => Promise<void>;
  /** Prefetches data for a popover card into the cache without opening it. */
  prefetchPopover: (key: TPopoverKey, parentData?: TData) => Promise<TData | undefined>;
  /** Invalidates cache and refetches data for one or more keys. */
  invalidate: (keyOrKeys: TPopoverKey | readonly TPopoverKey[]) => Promise<void>;
  /** Subscribes to entry state changes for a specific key. */
  subscribeKey: (
    key: TPopoverKey,
    listener: (
      entry: TrailEntry<TData, TPopoverKey> | undefined,
      prevEntry: TrailEntry<TData, TPopoverKey> | undefined,
    ) => void,
  ) => () => void;
  /** Destroys the store instance and disposes listeners. */
  destroy: () => void;
  /** Configures whether pinned child cards close when parent closes. */
  setClosePinnedDescendants: (close: boolean) => void;
  /** Updates boundary collision avoidance configuration. */
  setCollisionConfig: (config: CollisionConfig | null) => void;
  /** Closes a specific popover card by key. */
  closeByKey: (key: TPopoverKey, options?: { transition?: boolean }) => void;
  /** Enables or disables keyboard arrow key navigation. */
  setEnableArrowNavigation: (enable: boolean) => void;
  /** Enables or disables debug console logging. */
  setDebug: (debug: boolean) => void;
  /** Handles pointer hover entry buffer for a card. */
  hoverEnter: (key: TPopoverKey) => void;
  /** Handles pointer hover leave buffer for a card. */
  hoverLeave: (key: TPopoverKey, delay?: number) => void;
  /** Sets the pixel offset step for nested cascade cards. */
  setCascadeOffsetStep: (step: number) => void;
  /** Updates animation transition status for a card (`mounting` | `mounted` | `unmounting`). */
  setTransitionStatus: (key: TPopoverKey, status: PopoverTransitionStatus) => void;
  /** Sets exit transition animation duration in milliseconds. */
  setExitTransitionDuration: (duration: number) => void;
  /** Sets default anchor offset gap in pixels. */
  setDefaultOffset: (offset: number) => void;
  /** Sets base z-index depth offset. */
  setBaseZIndex: (baseZIndex: number) => void;
  /** Sets global animation CSS class names. */
  setGlobalAnimationClassNames: (mounting: string, unmounting: string, mounted: string) => void;
  /** Configures whether dragging is allowed on pinned cards. */
  setAllowDragWhenPinned: (allow: boolean) => void;
  /** Configures whether dragging is allowed on unpinned trail cards. */
  setAllowDragWhenUnpinned: (allow: boolean) => void;
  /** Sets mobile viewport breakpoint width in pixels. */
  setMobileBreakpoint: (breakpoint: number) => void;
  /** Configures WAI-ARIA Focus Lock options. */
  setFocusLockOptions: (options: FocusLockOptions | null) => void;
  /** Subscribes to lifecycle store events. */
  subscribeEvent: (listener: (event: PopoverStoreEvent<TData>) => void) => () => void;
  /** Batches multiple action mutations into a single subscriber notification. */
  batchUpdates: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  /** Runs action mutations wrapped in a React concurrent transition. */
  runTransition: (fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => void) => void;
  /** Registers a middleware interceptor into the store pipeline. */
  useMiddleware: (middleware: PopoverMiddleware<TData, TContext, TPopoverKey>) => () => void;
  /** Reverts the last state mutation step in navigation history. */
  undo: () => void;
  /** Reapplies the previously undone state mutation step. */
  redo: () => void;
  /** Returns true if undo history is available. */
  canUndo: () => boolean;
  /** Returns true if redo history is available. */
  canRedo: () => boolean;
  /** Executes mutations within a transactional boundary with automatic rollback on error. */
  transaction: (
    fn: (actions: PopoverActions<TData, TContext, TPopoverKey>) => Promise<void> | void,
  ) => Promise<boolean>;
  /** Persists current active state to external storage. */
  persistState: (config?: PopoverPersistConfig) => Promise<void>;
  /** Rehydrates persisted state from external storage. */
  rehydrateState: (config?: PopoverPersistConfig) => Promise<boolean>;
  /** Sets button control visibility options for a card. */
  setButtonControls: (key: TPopoverKey, controls: ButtonControlConfig) => void;
  /** Toggles a specific button control on a card. */
  toggleButtonControl: (
    key: TPopoverKey,
    control: 'enablePin' | 'enableClose' | 'enableDrag',
    enabled?: boolean,
  ) => void;
  /** Sets active stack group filter. */
  setStackGroupFilter: (group: string | null) => void;
  /** Sets responsive layout adaptation mode. */
  setResponsiveMode: (mode: PopoverResponsiveMode) => void;
  /** Sets base z-index depth map per stack group ID. */
  setZIndexBaseMap: (map: ZIndexBaseMap | null) => void;
  /** Sets global slot component overrides. */
  setSlotComponents: (components: PopoverSlotComponents | null) => void;
}

/**
 * Return signature of the `usePopover(key)` selector hook.
 *
 * @template TData - Resolved data payload type.
 * @template TPopoverKey - Popover key identifier union type.
 *
 * @example
 * ```tsx
 * function UserCard() {
 *   const { isOpen, data, isLoading, close, pin } = usePopover<UserData>('userProfile');
 *   if (!isOpen) return null;
 *   return <div>{data?.name}</div>;
 * }
 * ```
 */
export interface UsePopoverResult<TData = unknown, TPopoverKey extends string = string> {
  /** Active entry object if open, or undefined if closed. */
  entry: TrailEntry<TData, TPopoverKey> | undefined;
  /** Discriminated resolution state container. */
  state: PopoverEntryDiscriminatedState<TData>;
  /** Whether the card is currently open (in trail or pinned). */
  isOpen: boolean;
  /** Whether the card is currently pinned/floating. */
  isPinned: boolean;
  /** Computed z-index depth for visual stacking. */
  zIndex: number;
  /** Whether this card is the topmost in the active stack. */
  isTop: boolean;
  /** Active drag offset coordinates `(x, y)`. */
  offset: DragOffset;
  /** Whether async data resolution is in progress. */
  isLoading: boolean;
  /** Resolved data payload. */
  data: TData | null | undefined;
  /** Error instance if data resolution failed. */
  error: Error | null | undefined;
  /** Closes this popover card. */
  close: () => void;
  /** Pins this popover card at the given rect coordinates. */
  pin: (rect: DOMRect) => void;
  /** Brings this popover card to the front of the stack. */
  bringToFront: () => void;
  /** Updates drag offset coordinates for this card. */
  updateOffset: (x: number, y: number) => void;
}

/**
 * Combined Popover Trail Zustand store state and action interface.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Global external context type.
 * @template TPopoverKey - Union of valid popover string keys.
 * @template TSliceActions - Custom slice action methods.
 */
export type PopoverStore<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
  TSliceActions = object,
> = PopoverStateData<TData, TContext, TPopoverKey> &
  PopoverActions<TData, TContext, TPopoverKey> &
  TSliceActions & {
    actions: PopoverActions<TData, TContext, TPopoverKey> & TSliceActions;
  };

export { type PopoverKey, type ParentKey, type ZIndexDepth } from './branded';

export { type DeepReadonly } from './configTypes';
