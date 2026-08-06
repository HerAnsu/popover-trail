/**
 * Shared Context Scope for PopoverTimeline compound components.
 *
 * @module components/timeline/PopoverTimelineScopeContext
 */

import { createContext, useContext } from 'react';
import type { UsePopoverTimelineResult } from '../../context';
import { validateTimelineSubComponentScope } from '../../utils/devWarnings';

export interface PopoverTimelineScope {
  timeline: UsePopoverTimelineResult;
}

export const PopoverTimelineScopeContext = createContext<PopoverTimelineScope | null>(null);
PopoverTimelineScopeContext.displayName = 'PopoverTimelineScopeContext';

export function usePopoverTimelineScope() {
  const ctx = useContext(PopoverTimelineScopeContext);
  validateTimelineSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverTimeline> sub-components must be rendered within a <PopoverTimeline>');
  }
  return ctx;
}
