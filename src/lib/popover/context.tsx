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
  usePopoverEntry,
  usePopoverEntryStatus,
  usePopoverZIndex,
  useIsPopoverTopMost,
  usePopoverOffset,
  usePopoverContext,
  usePopoverCollisionConfig,
  useIsPopoverOpen,
  usePopover,
  usePopoverData,
  usePopoverHydration,
  type PopoverHydrationState,
} from './hooks/usePopoverSelectors';

export {
  usePopoverTimeline,
  type PopoverTimelineItem,
  type UsePopoverTimelineResult,
} from './hooks/usePopoverTimeline';

export { usePopoverTrigger, usePopoverNestedTrigger } from './hooks/usePopoverTriggers';
export { PopoverPortal, type PopoverPortalProps } from './components/PopoverPortal';
