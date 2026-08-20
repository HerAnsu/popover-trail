/**
 * Shared Context Scope for PopoverTimeline compound components.
 *
 * @module components/timeline/PopoverTimelineScopeContext
 */

import { createContext, useContext } from 'react';
import type { UsePopoverTimelineResult } from '../../context';
import { validateTimelineSubComponentScope } from '../../utils/devWarnings';

export interface PopoverTimelineScope<TData = unknown> {
  timeline: UsePopoverTimelineResult<TData>;
}

export const PopoverTimelineScopeContext = createContext<PopoverTimelineScope<unknown> | null>(
  null,
);
PopoverTimelineScopeContext.displayName = 'PopoverTimelineScopeContext';

function assertTimelineScope<TData>(ctx: unknown): asserts ctx is PopoverTimelineScope<TData> {
  validateTimelineSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverTimeline> sub-components must be rendered within a <PopoverTimeline>');
  }
}

export function usePopoverTimelineScope<TData = unknown>(): PopoverTimelineScope<TData> {
  const ctx = useContext(PopoverTimelineScopeContext);
  assertTimelineScope<TData>(ctx);
  return ctx;
}
