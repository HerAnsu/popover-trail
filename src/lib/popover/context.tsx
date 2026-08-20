/**
 * React Context, Provider, and Custom Hooks Engine for popover-trail.
 * Modular facade re-exporting primitives under `src/lib/popover/context/`.
 *
 * @module context
 */

export { PopoverStoreContext } from './context/PopoverStoreContext';
export { PopoverCardContext } from './context/PopoverCardContext';
export { PopoverProvider } from './context/PopoverProvider';
export type { PopoverProviderProps } from './context/PopoverProviderProps';
export { usePopoverStore, usePopoverStoreApi, usePopoverActions } from './context/usePopoverStore';
export { definePopoverContext } from './context/definePopoverContext';

export {
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
  useIsPopoverOpen,
  usePopoverIsOpen,
  usePopover,
  usePopoverData,
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
} from './hooks/usePopoverSelectors';

export {
  usePopoverTimeline,
  type PopoverTimelineItem,
  type UsePopoverTimelineResult,
} from './hooks/usePopoverTimeline';

export { usePopoverTrigger, usePopoverNestedTrigger } from './hooks/usePopoverTriggers';
export { PopoverPortal, type PopoverPortalProps } from './components/PopoverPortal';
