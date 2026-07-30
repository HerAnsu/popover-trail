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
  DragOffset,
  KnownKeyboardKey,
  TypedPopoverCache,
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
} from './types';

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
} from './types';

export { createWorkerResolver, type WorkerResolverOptions } from './utils/workerResolver';

export { createPopoverController, type PopoverController } from './utils/popoverController';

export { useEventListener } from './hooks/useEventListener';

export { invariant } from './utils/invariant';

export { clampDragCoordinates, computeTiltMatrix, applyDragFriction } from './utils/dragMath';

export { createPopoverStore } from './store';

export {
  PopoverProvider,
  usePopoverStore,
  usePopoverStoreApi,
  usePopoverTrail,
  usePopoverFloating,
  usePopoverOffsets,
  useIsPopoverPinned,
  usePopoverEntry,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverActions,
  usePopoverHydration,
  type PopoverHydrationState,
  usePopoverData,
  usePopoverTimeline,
  type UsePopoverTimelineResult,
  type PopoverTimelineItem,
  PopoverPortal,
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
  type SnapshotManagerOptions,
} from './store/snapshotManager';
export { PopoverDAG, type DAGNode } from './utils/dag';
export { QuadTree, type BoundingBox, type QuadItem } from './utils/quadTree';
export {
  createPopoverSchema,
  toSchemaKey,
  type PopoverSchemaDefinition,
  type PopoverSchemaInstance,
  type PopoverSchemaNode,
  type SchemaKeys,
  type SchemaData,
  type AllowedChildrenOf,
  type StrictPopoverKey,
} from './schema';

export { usePopoverGeometry, type UsePopoverGeometryResult } from './hooks/useGeometry';
export { usePopoverDragAndDrop, type UsePopoverDragAndDropResult } from './hooks/useDragAndDrop';
export { usePopoverCard, type UsePopoverCardResult } from './hooks/usePopoverCard';
export { getPopoverStyles } from './utils/styles';
export { SimplePopoverCache } from './utils/cache';
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
