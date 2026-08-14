/**
 * Store Event Definitions and Event Listener Maps for popover-trail.
 *
 * @module types/eventTypes
 */

import type { TrailEntry } from './entryTypes';

/** Valid event action kinds for popover store notifications. */
export type PopoverEventAction =
  | 'open_root'
  | 'push_nested'
  | 'close'
  | 'pin'
  | 'unpin'
  | 'resolve_start'
  | 'resolve_success'
  | 'resolve_error'
  | 'clear';

/** Template literal type representing namespaced event names. */
export type PopoverStoreEventName = `popover:${PopoverEventAction}`;

/**
 * Event objects emitted by store action lifecycles for monitoring, analytics, and debugging.
 *
 * @template TData - Resolved data payload type.
 */
export type PopoverStoreEvent<TData = unknown> =
  | { type: 'open_root'; key: string; ownerId: string }
  | { type: 'push_nested'; key: string; parentKey?: string }
  | { type: 'close'; keys: string[] }
  | { type: 'pin'; key: string }
  | { type: 'unpin'; key: string }
  | { type: 'resolve_start'; key: string }
  | { type: 'resolve_success'; key: string; data: TData }
  | { type: 'resolve_error'; key: string; error: Error }
  | { type: 'clear' };

/** Mapped type associating each event action type to its specific payload. */
export type PopoverStoreEventMap<TData = unknown> = {
  [E in PopoverStoreEvent<TData> as E['type']]: E;
};

/** Record mapping callback handlers to popover store events. */
export type OnPopoverEventMap<TData = unknown> = Record<
  string,
  (event: PopoverStoreEvent<TData>) => void
>;

/**
 * Represents an active step in the visual navigation timeline.
 *
 * @template TData - Resolved data payload type.
 */
export interface ActiveTimelineStep<TData = unknown> {
  /** Unique key identifying the timeline step. */
  stepKey: string;
  /** TrailEntry associated with this step in the stack. */
  entry: TrailEntry<TData>;
  /** Timestamp in milliseconds when this step was opened. */
  timestamp: number;
}

/**
 * Represents an undone step available in the redo history stack.
 *
 * @template TData - Resolved data payload type.
 */
export interface UndoneTimelineStep<TData = unknown> {
  /** Unique key identifying the undone timeline step. */
  stepKey: string;
  /** TrailEntry snapshot associated with this step. */
  entry: TrailEntry<TData>;
  /** Timestamp in milliseconds when this step was recorded. */
  timestamp: number;
}

/** Alias for an active timeline step. */
export type PopoverTimelineStep<TData = unknown> = ActiveTimelineStep<TData>;
