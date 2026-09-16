/**
 * popover-trail — Declarative, physics-driven popover trails for React 19.
 *
 * @module popover-trail
 */

// Types: Entries & Lifecycle
export type {
  TrailEntry,
  LoadingTrailEntry,
  ErrorTrailEntry,
  SuccessTrailEntry,
  DiscriminatedTrailEntry,
  PopoverEntryDiscriminatedState,
  NarrowTrailEntry,
  PopoverTransitionStatus,
} from './types/entryTypes';

// Types: Geometry
export type { PopoverRect, Vector2D } from './types/geometry';

// Types: Store & State
export type {
  PopoverResolver,
  PopoverStateData,
  PopoverActions,
  PopoverStore,
  PopoverMiddleware,
  TypedMiddlewarePatch,
  StoreActionPayload,
  StoreActionType,
  ExtractActionPayload,
  StoreActionPayloadMap,
  OnlyDataState,
  TypedPopoverStoreApi,
  StoreSliceDescriptor,
  StoreSliceCreator,
  StoreSetFn,
  StoreGetFn,
  ResolverParams,
  CancellablePopoverResolver,
  InferResolverData,
  UnionToIntersection,
  InferSliceActionsFromTuple,
  InferSliceStateFromTuple,
  IdleStoreState,
  ActiveTrailStoreState,
  PinnedOnlyStoreState,
  PopoverStoreDiscriminatedState,
  DomainPopoverKey,
  Brand,
  ViewportX,
  ViewportY,
  OwnerId,
  StackGroupId,
  TabId,
  DragOffset,
  ValidatedAnchorRef,
  AnchorEventLike,
  UsePopoverResult,
  ClosedUsePopoverResult,
  OpenUsePopoverResult,
} from './types/storeTypes';

export type { SliceContext } from './store/slices/context';
export type { PopoverStoreOptions, InternalPopoverState, InternalPopoverStore } from './store';

// Types: Configurations & Options
export type {
  PopoverPlacement,
  PopoverDisplayOptions,
  CollisionConfig,
  ClickOutsideConfig,
  HoverConfig,
  ButtonControlConfig,
  PopoverResponsiveMode,
  PopoverLayoutStrategy,
  KeyboardShortcutMap,
  FocusLockOptions,
  PopoverSlotComponents,
  ZIndexBaseMap,
  PopoverPersistConfig,
  PopoverConfig,
  PopoverCSSProperties,
  PopoverKeyId,
  KnownKeyboardKey,
  DeepReadonly,
} from './types/configTypes';

// Types: Events
export type {
  PopoverStoreEvent,
  PopoverEventAction,
  PopoverStoreEventName,
  PopoverStoreEventMap,
  PopoverEventMap,
  OnPopoverEventMap,
  PopoverEventHandlerMap,
  ActiveTimelineStep,
  UndoneTimelineStep,
} from './types/eventTypes';

export type {
  PopoverEventRegistry,
  BuiltinPopoverEventPayloadMap,
  PopoverEventPayloadMap,
  PopoverEventType,
} from './store';

// Types: Branded & Polymorphic
export type {
  Brand as BrandedType,
  PopoverKey,
  ParentKey,
  StackGroupId as StackGroupBrand,
  ZIndexDepth,
  TriggerId,
  ScopeId,
  SubscriptionId,
  WorkerTaskId,
  CausalSequence,
  StorageKey,
  ChannelId,
  CacheKey,
  HistoryCapacity,
  DurationMs,
  TimestampMs,
  Unbrand,
  BrandTagOf,
  IsBranded,
  AnyBrand,
} from './types/branded';

// Types: Global Schema Registry Declaration Merging
export type {
  Register,
  RegisteredSchema,
  RegisteredKeys,
  RegisteredDataMap,
  ResolveRegisteredData,
} from './types/registerTypes';

export { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT, emptyRecord, unbrand } from './types/branded';

// Types: Universal Type Utilities
export type {
  MaybePromise,
  Nullable,
  Maybe,
  Falsy,
  Predicate,
  AsyncPredicate,
  ValueOf,
  DeepPartial,
  InferOk,
  InferErr,
  NonEmptyArray,
  EventPayload,
} from './types/utilityTypes';

export type {
  PolymorphicRef,
  PolymorphicPropsWithRef,
  PolymorphicProps,
} from './types/polymorphicTypes';

// Type Guards & Utility Builders
export { isSuccessEntry, isIdleEntry, isEntryWithStatus } from './types/entry/entryGuards';
export * from './utils/typeGuards';

export { matchEntryState } from './types/entryTypes';
export { matchActionState, type ActionStateMatchers } from './utils/matchActionState';
export type { HistoryError } from './store/history';
export type { PopoverNotFoundError } from './store/cqrs';
export type { SingularMatrixError, SpatialNotFoundError } from './utils/spatial';
export { invertMatrix2DResult } from './utils/spatial';
export { defineStoreSlice } from './types/storeTypes';

// Core Store & Context
export { createPopoverStore } from './store';
export * from './context';

// Components & Compounds
export * from './components';

// Reactive Integration & Hooks (Layer 3)
export * from './hooks';

// Utilities & Factories
export { createPopoverTrail } from './factory';
export {
  createPopoverController,
  type PopoverController,
  type PopoverCardFluentBuilder,
} from './utils/popoverController';
export {
  DISPLAY_OPTION_KEYS,
  extractDisplayOptions,
  mergeDisplayOptions,
  areDisplayOptionsEqual,
  isDisplayOptionKey,
  type DisplayOptionKey,
} from './utils/displayOptions';
export { PopoverTransitionScheduler } from './store';
export { invariant } from './utils/invariant';
export { assertNever } from './utils/assertNever';
export {
  clampDragCoordinates,
  clampDragCoordinatesInPlace,
  computeTiltMatrix,
  applyDragFriction,
} from './utils/dragMath';
export { getPopoverStyles } from './utils/styles';
export {
  SimplePopoverCache,
  BasePopoverCache,
  MemoryStorageAdapter,
  WebStorageAdapter,
  getCacheEntryState,
  type TypedPopoverCache,
  type CacheStats,
  type CacheEntry,
  type CacheEntryState,
  type CacheEventHandlerMap,
  type CacheOptions,
  type SWRFetchOptions,
  type StorageAdapter,
} from './utils/cache';
export { TriggerRegistry } from './utils/triggerRegistry';
export { ResizeObserverRegistry } from './utils/resizeObserverRegistry';
export {
  PopoverError,
  PopoverErrorCode,
  createPopoverError,
  formatPopoverErrorMessage,
} from './utils/errors';
export { Point2D, RectBounds } from './utils/valueObjects';
export {
  Ok,
  Err,
  isOk,
  isErr,
  mapResult,
  mapErr,
  flatMapResult,
  unwrapOr,
  unwrapOrElse,
  unwrap,
  matchResult,
  tapResult,
  tapErr,
  wrapResult,
  wrapAsyncResult,
  fromThrowable,
  fromPromise,
  collectResults,
  partitionResults,
  combineResults,
  mapAsyncResult,
  flatMapAsyncResult,
  type Result,
  type OkResult,
  type ErrResult,
} from './utils/result';

// Utilities: Async & Concurrency
export {
  sleep,
  deferMicrotask,
  withTimeout,
  deferred,
  debounce,
  throttle,
  retryAsync,
  createAsyncMutex,
  type Deferred,
  type DebouncedFunction,
  type ThrottledFunction,
  type RetryOptions,
  type AsyncMutex,
} from './utils/asyncUtils';

// Utilities: Collections & Objects
export { unique, partition, groupBy, keyBy, chunk, zip, range, compact } from './utils/collections';
export {
  first,
  last,
  take,
  drop,
  concatImmutable,
} from './utils/arrayUtils';
export {
  isNonNullable,
  isDefined,
  isNull,
  isUndefined,
  isMatchingKey,
  hasKeyIn,
} from './utils/predicates';

export {
  clamp,
  lerp,
  inRange,
  degToRad,
  radToDeg,
  roundTo,
  approxEqual,
  normalizeRatio,
} from './utils/math';
export {
  omitKey,
  omitKeys,
  pickKeys,
  safeAssign,
  isEmptyRecord,
  mapValues,
  filterObject,
  compactObject,
  invertObject,
  deepFreeze,
} from './utils/cleanObject';
export {
  setUnion,
  setIntersection,
  setDifference,
  setSymmetricDifference,
  isSubset,
  isSuperset,
  isDisjoint,
} from './utils/setOperations';
export {
  identity,
  noop,
  constant,
  pipe,
  compose,
  curry2,
  prop,
  propEq,
  and,
  or,
  not,
} from './utils/functional';

export {
  memoizeOne,
  memoizeWeak,
  type MemoizedFn,
} from './utils/memoize';
export {
  kebabCase,
  camelCase,
  capitalize,
  ensurePrefix,
  ensureSuffix,
  truncate,
} from './utils/stringUtils';


export {
  createDisposable,
  CompositeDisposable,
  AsyncCompositeDisposable,
  using,
  usingAsync,
  usingResult,
  usingAsyncResult,
  createTimerDisposable,
  createRafDisposable,
  createEventListenerDisposable,
  createAbortDisposable,
  createSubscriptionDisposable,
  assertNotDisposed,
  isDisposable,
  isAsyncDisposable,
  type ScopeDisposable,
  type AsyncScopeDisposable,
  type CleanupItem,
  type AsyncCleanupItem,
} from './utils/disposable';
export {
  LayoutStrategyRegistry,
  globalLayoutStrategyRegistry,
  FixedCenterLayoutStrategy,
  DockedBottomLayoutStrategy,
  RelativeFloatingLayoutStrategy,
  DockedTopLayoutStrategy,
  type LayoutStrategyParams,
  type PopoverLayoutStrategyEngine,
} from './utils/layoutStrategies';
export { PopoverQueryBus, PopoverCommandBus, createCQRSBuses } from './store';
export {
  assertNonNullable,
  assertValidPopoverKey,
  assertValidOwnerId,
  assertValidRect,
} from './utils/assertions';
export { fastClone } from './utils/clone';
export {
  createBroadcastSync,
  type PopoverSyncMessage,
  type PopoverSyncListener,
} from './utils/broadcastSync';
export {
  PopoverEventBus,
  globalPopoverEventBus,
  PopoverCustomEvent,
  createPopoverEvent,
  dispatchStoreEvent,
  isPopoverCustomEvent,
} from './store';
export { trackMemoryCleanup, untrackMemoryCleanup } from './utils/memorySentinel';
export { applyThemeTokens, removeThemeTokens, type PopoverThemeTokens } from './utils/themeTokens';
export { ObjectPool } from './utils/objectPool';
export { clsx } from './utils/clsx';
export {
  sanitizeRect,
  isPromise,
  shallowEqual,
  isDeepEqual,
  toError,
  updateEntryInLists,
  getSnapshotStatePatch,
  createInitialTrailEntry,
  closeFromState,
  createSuccessEntry,
  createLoadingEntry,
  createErrorEntry,
  createIdleEntry,
  getEntryAtIndex,
  findEntryIndex,
  hasEntryWithKey,
  findEntryInStore,
} from './utils/storeHelpers';
export { PopoverMiddlewareEngine, composeMiddlewares } from './store';
export {
  isKeyInZIndexOrder,
  isPinnedEntry,
  reduceTogglePinState,
  reduceUpdateOffsetState,
} from './store';
export {
  validateSchemaCircularChild,
  validateResolverTimeout,
  validatePortalExclusion,
  markPerformance,
  measurePerformance,
} from './validators';
export {
  selectActiveTrail,
  selectFloatingEntries,
  selectEntryByKey,
  selectTopmostEntry,
  selectIsPinned,
  selectOffset,
  selectZIndexOrder,
  selectTotalActiveCount,
  selectIsIdle,
  selectHasEntry,
  selectRootEntry,
  selectIsLoading,
  selectError,
  selectData,
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
  createTypedStoreSelector,
  type StoreSelectorMapper,
  selectDiscriminatedStatus,
} from './store';
export {
  createHistoryManager,
  createHistorySnapshot,
  type HistorySnapshot,
  type HistoryTimelineProjection,
  type HistoryManager,
} from './store';
export {
  createPopoverFSM,
  popoverFSMReducer,
  assertPopoverFSMState,
  canTransition,
  FSMStatusBit,
  STATE_VALUE_TO_BIT_MAP,
  type PopoverStateValue,
  type ValidNextFSMState,
  type ValidStateTransitions,
  type PopoverFSMContext,
  type PopoverFSMEvent,
  type PopoverFSMState,
  type PopoverFSMOptions,
  type PopoverFSMInitialParam,
  type PopoverFSMInterpreter,
  type IdleFSMState,
  type HydratingFSMState,
  type ResolvedTrailingFSMState,
  type ResolvedPinnedFSMState,
  type ErrorFSMState,
  type UnmountingFSMState,
} from './store';
export {
  PopoverSnapshotManager,
  type PopoverSnapshotData,
  type PopoverStoreSnapshot,
  type SnapshotManagerOptions,
} from './store';
export * from './utils/dag';
export * from './utils/spatial';
export {
  createPopoverSchema,
  toSchemaKey,
  defineSchemaNode,
  mergePopoverSchemas,
  type InferSchemaContext,
  type PopoverSchemaDefinition,
  type PopoverSchemaInstance,
  type PopoverSchemaNode,
  type SchemaKeys,
  type InferSchemaKeys,
  type SchemaKeyOf,
  type SchemaDataMap,
  type InferSchemaDataMap,
  type SchemaData,
  type AllowedChildrenOf,
  type StrictPopoverKey,
} from './schema';
export {
  createWorkerResolver,
  definePopoverWorkerRPC,
  type WorkerResolverOptions,
} from './utils/workerResolver';
export {
  toPopoverKey,
  toParentKey,
  toOwnerId,
  toStackGroupId,
  toTriggerId,
  toScopeId,
  toSubscriptionId,
  toWorkerTaskId,
  toCausalSequence,
  toStorageKey,
  toChannelId,
  toCacheKey,
  toDurationMs,
  toTimestampMs,
  toZIndexDepth,
  toHistoryCapacity,
  isPopoverKey,
  isParentKey,
  isOwnerId,
  isStackGroupId,
  isTriggerId,
  isScopeId,
  isSubscriptionId,
  isWorkerTaskId,
  isCausalSequence,
  isStorageKey,
  isChannelId,
  isCacheKey,
  isHistoryCapacity,
} from './utils/branded';
export { useCrossVersionActionState, useCrossVersionOptimistic } from './utils/react19Adapters';
export { Slot, mergeProps, type SlotProps } from './utils/slot';
export { resolvePopoverAriaAttributes, resolveTriggerAriaAttributes } from './utils/a11y';
export { FocusTrap, type FocusTrapProps } from './components/FocusTrap';
export {
  PopoverCardHeader,
  type PopoverCardHeaderProps,
} from './components/card/PopoverCardHeader';
export type {
  PositionCoordinates,
  PositionComputeOptions,
  PositioningAdapter,
} from './positioning';
export * from './constants';
export * from './utils/cache';
export * from './utils/buffer';
export * from './utils/resource';
export { ResolverTelemetryLog } from './store/resolver';
