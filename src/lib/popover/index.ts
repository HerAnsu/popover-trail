/**
 * popover-trail — Declarative, physics-driven popover trails for React 19.
 *
 * @module popover-trail
 *
 * @example
 * ```tsx
 * import { PopoverProvider, PopoverTrigger, PopoverPortal, usePopover } from 'popover-trail';
 *
 * function App() {
 *   return (
 *     <PopoverProvider resolveData={async (key) => ({ title: `Data for ${key}` })}>
 *       <PopoverTrigger popoverKey="card-1">
 *         <button>Open Card 1</button>
 *       </PopoverTrigger>
 *       <PopoverPortal>
 *         {(entries) => entries.map((entry) => <MyCard key={entry.key} entry={entry} />)}
 *       </PopoverPortal>
 *     </PopoverProvider>
 *   );
 * }
 * ```
 */

export type {
  TrailEntry,
  PopoverResolver,
  PopoverStateData,
  PopoverActions,
  PopoverStore,
  PopoverPlacement,
  PopoverDisplayOptions,
  CollisionConfig,
  ClickOutsideConfig,
  HoverConfig,
  AnchorEventLike,
  UsePopoverResult,
  PopoverTransitionStatus,
  CascadeOffsetDirection,
  DragAxis,
  PopoverKey,
  ButtonControlConfig,
  PopoverResponsiveMode,
  PopoverLayoutStrategy,
  KeyboardShortcutMap,
  PopoverEntryDiscriminatedState,
  FocusLockOptions,
  PopoverSlotComponents,
  ZIndexBaseMap,
  PopoverMiddleware,
  TypedMiddlewarePatch,
  PopoverPersistConfig,
  Brand,
  ViewportX,
  ViewportY,
  OwnerId,
  StackGroupId,
  TabId,
  ReadonlyDeep,
  DragOffset,
  KnownKeyboardKey,
  ResolverParams,
  CancellablePopoverResolver,
  LoadingTrailEntry,
  ErrorTrailEntry,
  SuccessTrailEntry,
  InferResolverData,
  OnPopoverEventMap,
  ActiveTimelineStep,
  UndoneTimelineStep,
  PopoverTimelineStep,
  NarrowTrailEntry,
  IdleStoreState,
  ActiveTrailStoreState,
  PinnedOnlyStoreState,
  PopoverStoreDiscriminatedState,
  DomainPopoverKey,
  PopoverConfig,
  TypedPopoverStoreApi,
  StoreActionPayload,
  OnlyDataState,
  PopoverCSSProperties,
  PolymorphicProps,
  PopoverKeyId,
  PopoverStoreEventMap,
  PopoverEventAction,
  PopoverStoreEventName,
  StoreSliceDescriptor,
  StoreSliceCreator,
  ParentKey,
  ZIndexDepth,
  DeepReadonly,
} from './types';

export { EMPTY_READONLY_ARRAY, EMPTY_READONLY_OBJECT } from './types';
export type { ValidatedAnchorRef } from './types';

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
  matchEntryState,
  defineStoreSlice,
} from './types';

export {
  createWorkerResolver,
  definePopoverWorkerRPC,
  type WorkerResolverOptions,
} from './utils/workerResolver';

export { createPopoverController, type PopoverController } from './utils/popoverController';

export { useEventListener } from './hooks/useEventListener';

export { invariant } from './utils/invariant';

export {
  clampDragCoordinates,
  clampDragCoordinatesInPlace,
  computeTiltMatrix,
  applyDragFriction,
} from './utils/dragMath';

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
  usePopoverEntry,
  usePopoverEntryStatus,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  usePopoverActions,
  usePopoverHydration,
  type PopoverHydrationState,
  usePopoverIsLoading,
  usePopoverError,
  usePopoverRootEntry,
  usePopoverTotalActiveCount,
  useIsPopoverIdle,
  usePopoverData,
  usePopoverTimeline,
  type UsePopoverTimelineResult,
  type PopoverTimelineItem,
  PopoverPortal,
  type PopoverPortalProps,
  usePopoverTrigger,
  usePopoverNestedTrigger,
  useIsPopoverOpen,
  usePopover,
  PopoverCardContext,
  definePopoverContext,
} from './context';

export {
  createPopoverFSM,
  popoverFSMReducer,
  assertPopoverFSMState,
  type PopoverStateValue,
  type ValidStateTransitions,
  type PopoverFSMContext,
  type PopoverFSMEvent,
  type PopoverFSMState,
  type IdleFSMState,
  type HydratingFSMState,
  type ResolvedTrailingFSMState,
  type ResolvedPinnedFSMState,
  type ErrorFSMState,
  type UnmountingFSMState,
  type TransitionFn,
  type TransitionTable,
} from './store/fsm';
export {
  PopoverSnapshotManager,
  type PopoverSnapshotData,
  type PopoverStoreSnapshot,
  type SnapshotManagerOptions,
} from './store/snapshotManager';
export { PopoverDAG, type DAGNode } from './utils/dag';
export { QuadTree, type BoundingBox, type QuadItem } from './utils/quadTree';
export {
  createPopoverSchema,
  toSchemaKey,
  defineSchemaNode,
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
export { usePopoverCard, type UsePopoverCardResult } from './hooks/usePopoverCard';
export { getPopoverStyles } from './utils/styles';
export { SimplePopoverCache, type TypedPopoverCache } from './utils/cache';
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
  type PolymorphicRef,
  type PolymorphicPropsWithRef,
} from './components/PopoverCard';
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
export { type HistorySnapshot } from './store/history';
export { createPopoverTrail } from './factory';
export { useMergedRef, useStableCallback } from './hooks/useHookUtils';
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
} from './utils/result';
export { createDisposable, CompositeDisposable, type ScopeDisposable } from './utils/disposable';
export {
  LayoutStrategyRegistry,
  globalLayoutStrategyRegistry,
  FixedCenterLayoutStrategy,
  DockedBottomLayoutStrategy,
  RelativeFloatingLayoutStrategy,
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
  type PopoverEventType,
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
  mergeEntryOptions,
  closeFromState,
} from './utils/storeHelpers';
export { PopoverMiddlewareEngine } from './store/storeMiddlewareEngine';
export { isKeyInZIndexOrder, reduceTogglePinState } from './store/storeActions';
export {
  validateSchemaCircularChild,
  validateResolverTimeout,
  validatePortalExclusion,
  markPerformance,
  measurePerformance,
} from './utils/devWarnings';
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
  createTypedStoreSelector,
  type StoreSelectorMapper,
  selectDiscriminatedStatus,
} from './store/storeSelectors';
export type { HydrationState } from './store/storeHydration';
export type { InternalPopoverState, InternalPopoverStore } from './store/storeTypes';
export * from './constants';
