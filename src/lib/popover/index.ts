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
} from './types';

export {
  isResolvedEntry,
  isLoadingEntry,
  isErrorEntry,
  getEntryState,
  createPopoverKey,
  createPopoverResolver,
  createVirtualElement,
} from './types';

export { createWorkerResolver, type WorkerResolverOptions } from './utils/workerResolver';

export { createPopoverController, type PopoverController } from './utils/popoverController';

export { useEventListener } from './hooks/useEventListener';

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
  PopoverPortal,
  usePopoverTrigger,
  usePopoverNestedTrigger,
  useIsPopoverOpen,
  usePopover,
  PopoverCardContext,
} from './context';

export { usePopoverGeometry, type UsePopoverGeometryResult } from './hooks/useGeometry';
export { usePopoverDragAndDrop, type UsePopoverDragAndDropResult } from './hooks/useDragAndDrop';
export { usePopoverCard, type UsePopoverCardResult } from './hooks/usePopoverCard';
export { getPopoverStyles } from './utils/styles';
export { SimplePopoverCache } from './utils/cache';
export { PopoverTrigger, type PopoverTriggerProps } from './components/PopoverTrigger';
export { createPopoverTrail } from './factory';
