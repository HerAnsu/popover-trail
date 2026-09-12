/**
 * Type Guards for Async Resolution, Drag Events, and Timeline Steps.
 * Clean Architecture Layer 2: Headless State Management & Events.
 *
 * @module utils/guards/eventLifecycleGuards
 */

import type { PopoverStoreEvent, PopoverEventAction } from '../../types/eventTypes';
import type { PopoverTimelineStep, ActiveTimelineStep } from '../../types/events/timelineEvents';
import { isPlainObject } from './objectGuards';

function matchesEventAction<
  TData,
  TPopoverKey extends string,
  A extends PopoverEventAction,
>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
  action: A,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: A | `popover:${A}` }> {
  return event.type === action || event.type === `popover:${action}`;
}

/** Type guard for 'resolve_start' event. */
export function isResolveStartEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'resolve_start' | 'popover:resolve_start' }> {
  return matchesEventAction(event, 'resolve_start');
}

/** Type guard for 'resolve_success' event. */
export function isResolveSuccessEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
  { type: 'resolve_success' | 'popover:resolve_success' }
> {
  return matchesEventAction(event, 'resolve_success');
}

/** Type guard for 'resolve_error' event. */
export function isResolveErrorEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'resolve_error' | 'popover:resolve_error' }> {
  return matchesEventAction(event, 'resolve_error');
}

/** Type guard for 'resolve_perf' event. */
export function isResolvePerfEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'resolve_perf' | 'popover:resolve_perf' }> {
  return matchesEventAction(event, 'resolve_perf');
}

/** Type guard for 'drag_start' event. */
export function isDragStartEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'drag_start' | 'popover:drag_start' }> {
  return matchesEventAction(event, 'drag_start');
}

/** Type guard for 'drag_end' event. */
export function isDragEndEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'drag_end' | 'popover:drag_end' }> {
  return matchesEventAction(event, 'drag_end');
}

/** Validates whether an unknown candidate conforms to PopoverTimelineStep. */
export function isTimelineStep<TData = unknown>(val: unknown): val is PopoverTimelineStep<TData> {
  return (
    isPlainObject(val) &&
    typeof val.stepKey === 'string' &&
    typeof val.timestamp === 'number' &&
    Number.isFinite(val.timestamp) &&
    'entry' in val &&
    isPlainObject(val.entry)
  );
}

/** Validates whether an unknown candidate conforms to ActiveTimelineStep. */
export function isActiveTimelineStep<TData = unknown>(
  val: unknown,
): val is ActiveTimelineStep<TData> {
  return isTimelineStep<TData>(val);
}
