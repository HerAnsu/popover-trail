/**
 * Clean Architecture Layer 3: Reactive Integration & Hooks Domain Barrel.
 * Single Source of Truth for all popover-trail React hooks.
 *
 * @module hooks
 */

// Selectors
export * from './selectors';

// React 19 Action & Optimistic
export { usePopoverAction } from './usePopoverAction';
export { usePopoverOptimistic, usePopoverCardOptimistic } from './usePopoverOptimistic';
export { useCrossVersionActionState, useCrossVersionOptimistic } from './adapters/react19Adapters';

// Focus & A11y
export { useFocusTrap, type UseFocusTrapOptions } from './useFocusTrap';

// DAG Graph Topology
export {
  usePopoverDAG,
  useGeodesicPath,
  usePopoverParents,
  usePopoverChildren,
  type UsePopoverDAGResult,
} from './usePopoverDAG';

// Spatial & Geometry
export { useSafeCorridor, type UseSafeCorridorOptions } from './useSafeCorridor';
export {
  usePopoverGeometry,
  type UsePopoverGeometryOptions,
  type UsePopoverGeometryResult,
} from './useGeometry';
export {
  usePopoverDragAndDrop,
  type UsePopoverDragAndDropOptions,
  type UsePopoverDragAndDropResult,
} from './useDragAndDrop';

// Card Lifecycle & Navigation
export {
  usePopoverCard,
  type UsePopoverCardResult,
  type CardKeyboardNavigationOptions,
} from './usePopoverCard';

// Cache Hooks
export { usePopoverCache, type UsePopoverCacheResult } from './usePopoverCache';
export {
  usePopoverCacheValue,
  type UsePopoverCacheValueOptions,
  type UsePopoverCacheValueResult,
} from './usePopoverCacheValue';
export { usePopoverCacheQuery } from './usePopoverCacheQuery';
export type {
  PopoverCacheQueryState,
  UsePopoverCacheQueryOptions,
  UsePopoverCacheQueryResult,
} from './usePopoverCacheQueryTypes';
export {
  isSWRCompatibleCache,
  asSWRCompatibleCache,
  isExtendedCache,
  type ExtendedCache,
  type SWRCompatibleCache,
} from './usePopoverCacheTypes';

// Resource Lifecycle & Disposables
export { useDisposable, useCompositeDisposable } from './useDisposable';

// Timeline & History
export {
  usePopoverTimeline,
  type PopoverTimelineItem,
  type UsePopoverTimelineResult,
} from './usePopoverTimeline';

// Triggers
export { usePopoverTrigger, usePopoverNestedTrigger } from './usePopoverTriggers';

// Interaction & DOM
export { useClickOutside, type UseClickOutsideOptions } from './useClickOutside';
export { useEventListener } from './useEventListener';
export { useBodyScrollLock, acquireScrollLock, releaseScrollLock } from './useBodyScrollLock';
export {
  useMergedRef,
  useStableCallback,
  useLatestRef,
  useIsMounted,
  usePrevious,
  setRef,
  mergeRefs,
} from './useHookUtils';
