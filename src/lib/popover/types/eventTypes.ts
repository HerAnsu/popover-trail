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

export type OnPopoverEventMap<TData = unknown> = Record<
  string,
  (event: PopoverStoreEvent<TData>) => void
>;

export interface ActiveTimelineStep<TData = unknown> {
  stepKey: string;
  entry: TrailEntry<TData>;
  timestamp: number;
}

export interface UndoneTimelineStep<TData = unknown> {
  stepKey: string;
  entry: TrailEntry<TData>;
  timestamp: number;
}

export type PopoverTimelineStep<TData = unknown> = ActiveTimelineStep<TData>;
