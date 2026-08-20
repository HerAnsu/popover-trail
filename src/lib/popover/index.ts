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
  PopoverEntryDiscriminatedState,
  NarrowTrailEntry,
  PopoverTransitionStatus,
} from './types/entryTypes';

// Types: Store & State
export type {
  PopoverResolver,
  PopoverStateData,
  PopoverActions,
  PopoverStore,
  PopoverMiddleware,
  TypedMiddlewarePatch,
  StoreActionPayload,
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
} from './types/storeTypes';

export type { SliceContext } from './store/slices/sliceContext';
export type { PopoverStoreOptions } from './store';

// Internal Store Implementation Types
export type { InternalPopoverState, InternalPopoverStore } from './store/storeTypes';

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
  OnPopoverEventMap,
  ActiveTimelineStep,
  UndoneTimelineStep,
} from './types/eventTypes';

export type {
  PopoverEventRegistry,
  BuiltinPopoverEventPayloadMap,
  PopoverEventPayloadMap,
  PopoverEventType,
} from './store/eventBus';

// Types: Branded & Polymorphic
export type {
  Brand as BrandedType,
  PopoverKey,
  ParentKey,
  StackGroupId as StackGroupBrand,
  ZIndexDepth,
} from './types/branded';

export { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT } from './types/branded';

export type {
  PolymorphicRef,
  PolymorphicPropsWithRef,
  PolymorphicProps,
} from './types/polymorphicTypes';

// Type Guards & Utility Builders
export {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  createPopoverResolver,
  definePopoverResolver,
  createVirtualElement,
  isOpenRootEvent,
  isPushNestedEvent,
  isCloseEvent,
  isPinEvent,
  isUnpinEvent,
  isResolveStartEvent,
  isResolveSuccessEvent,
  isResolveErrorEvent,
  isClearEvent,
  isStoreEvent,
  definePopoverConfig,
  definePopoverMiddleware,
  toViewportX,
  toViewportY,
  toValidatedAnchorRef,
  isVirtualElementAnchor,
  isEventAnchor,
  extractNumericStyle,
  assertIsTrailEntry,
  assertIsDOMRect,
  isPopoverPlacement,
} from './utils/typeGuards';

export { matchEntryState } from './types/entryTypes';
export { defineStoreSlice } from './types/storeTypes';

// Core Store & Hooks
export { createPopoverStore } from './store';
export {
  PopoverStoreContext,
  PopoverProvider,
  type PopoverProviderProps,
  usePopoverStore,
  usePopoverStoreApi,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  useIsPopoverPinned,
  usePopoverIsPinned,
  usePopoverEntry,
  usePopoverEntryStatus,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverIsTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  usePopoverActions,
  usePopoverHydration,
  type PopoverHydrationState,
  usePopoverIsLoading,
  useIsPopoverLoading,
  usePopoverError,
  useIsPopoverError,
  usePopoverRootEntry,
  usePopoverTotalActiveCount,
  useIsPopoverIdle,
  usePopoverIsIdle,
  usePopoverParentKey,
  usePopoverChildrenKeys,
  usePopoverBreadcrumbs,
  usePopoverDepth,
  usePopoverData,
  usePopoverTimeline,
  type UsePopoverTimelineResult,
  type PopoverTimelineItem,
  PopoverPortal,
  type PopoverPortalProps,
  usePopoverTrigger,
  usePopoverNestedTrigger,
  useIsPopoverOpen,
  usePopoverIsOpen,
  usePopover,
  PopoverCardContext,
  definePopoverContext,
} from './context';

// Components & Compounds
export {
  PopoverTrigger,
  type PopoverTriggerProps,
  type PopoverTriggerChildProps,
} from './components/PopoverTrigger';

export {
  PopoverCard,
  type PopoverCardProps,
  type PopoverCardBaseProps,
  type PopoverCardHandleProps,
  type PopoverCardPinButtonProps,
  type PopoverCardCloseButtonProps,
  type PopoverCardContentProps,
} from './components/PopoverCard';

export { PopoverCardHandle } from './components/card/PopoverCardHandle';
export { PopoverCardPinButton } from './components/card/PopoverCardPinButton';
export { PopoverCardCloseButton } from './components/card/PopoverCardCloseButton';
export { PopoverCardContent } from './components/card/PopoverCardContent';

export { PopoverTrail, type PopoverTrailProps } from './components/PopoverTrail';

export {
  PopoverTimeline,
  type PopoverTimelineProps,
  type PopoverTimelineBaseProps,
  type PopoverTimelineStepListProps,
  type PopoverTimelineStepBaseProps,
  type PopoverTimelineStepProps,
  type PopoverTimelineUndoButtonProps,
  type PopoverTimelineRedoButtonProps,
} from './components/PopoverTimeline';

export {
  PopoverTimelineStepList,
  PopoverTimelineStep,
} from './components/timeline/PopoverTimelineSteps';

export {
  PopoverTimelineUndoButton,
  PopoverTimelineRedoButton,
} from './components/timeline/PopoverTimelineButtons';

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
export { PopoverTransitionScheduler } from './store/transitionScheduler';
export { useEventListener } from './hooks/useEventListener';
export { useMergedRef, useStableCallback } from './hooks/useHookUtils';
export { invariant } from './utils/invariant';
export {
  clampDragCoordinates,
  clampDragCoordinatesInPlace,
  computeTiltMatrix,
  applyDragFriction,
} from './utils/dragMath';
export { getPopoverStyles } from './utils/styles';
export { SimplePopoverCache, type TypedPopoverCache, type CacheStats } from './utils/cache';
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
  unwrap,
  matchResult,
  wrapResult,
  wrapAsyncResult,
  type Result,
  type OkResult,
  type ErrResult,
} from './utils/result';
export { createDisposable, CompositeDisposable, type ScopeDisposable } from './utils/disposable';
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
export { PopoverQueryBus, PopoverCommandBus, createCQRSBuses } from './store/cqrs';
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
} from './store/eventBus';
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
export { PopoverMiddlewareEngine } from './store/storeMiddlewareEngine';
export {
  isKeyInZIndexOrder,
  isPinnedEntry,
  reduceTogglePinState,
  reduceUpdateOffsetState,
} from './store/storeActions';
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
} from './store/storeSelectors';
export {
  createHistoryManager,
  createHistorySnapshot,
  type HistorySnapshot,
  type HistoryTimelineProjection,
  type HistoryManager,
} from './store/history';
export {
  createPopoverFSM,
  popoverFSMReducer,
  assertPopoverFSMState,
  FSMStatusBit,
  STATE_VALUE_TO_BIT_MAP,
  type PopoverStateValue,
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
} from './store/fsm';
export {
  PopoverSnapshotManager,
  type PopoverSnapshotData,
  type PopoverStoreSnapshot,
  type SnapshotManagerOptions,
} from './store/snapshotManager';
export { PopoverDAG, type DAGNode } from './utils/dag';
export { QuadTree, type BoundingBox, type QuadItem, boxesIntersect } from './utils/quadTree';
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
export { usePopoverGeometry, type UsePopoverGeometryResult } from './hooks/useGeometry';
export { usePopoverDragAndDrop, type UsePopoverDragAndDropResult } from './hooks/useDragAndDrop';
export {
  usePopoverCard,
  type UsePopoverCardResult,
  type CardKeyboardNavigationOptions,
} from './hooks/usePopoverCard';
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
  toDurationMs,
  toTimestampMs,
  toZIndexDepth,
  isPopoverKey,
} from './utils/branded';
export { useCrossVersionActionState, useCrossVersionOptimistic } from './utils/react19Adapters';
export { usePopoverAction } from './hooks/usePopoverAction';
export { usePopoverOptimistic, usePopoverCardOptimistic } from './hooks/usePopoverOptimistic';
export type {
  PopoverActionStatus,
  PopoverActionState,
  PopoverServerAction,
  UsePopoverActionOptions,
  UsePopoverActionResult,
} from './types/react19Types';
export type { HydrationState } from './store/storeHydration';
export * from './constants';
