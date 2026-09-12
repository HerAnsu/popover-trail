/**
 * Timeline Steps and History Tracking Event Payloads.
 *
 * @module types/events/timelineEvents
 */

import type { TrailEntry } from '../entryTypes';

export interface ActiveTimelineStep<TData = unknown, TPopoverKey extends string = string> {
  stepKey: string;
  entry: TrailEntry<TData, TPopoverKey>;
  timestamp: number;
}

export interface UndoneTimelineStep<TData = unknown, TPopoverKey extends string = string> {
  stepKey: string;
  entry: TrailEntry<TData, TPopoverKey>;
  timestamp: number;
}

export type PopoverTimelineStep<
  TData = unknown,
  TPopoverKey extends string = string,
> = ActiveTimelineStep<TData, TPopoverKey>;
