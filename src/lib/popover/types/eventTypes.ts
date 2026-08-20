/**
 * Store Event Definitions and Event Listener Maps for popover-trail.
 *
 * @module types/eventTypes
 */

import type { TrailEntry } from './entryTypes';

/**
 * Core action identifier emitted during store state changes.
 */
export type PopoverEventAction =
  | 'open_root'
  | 'push_nested'
  | 'close'
  | 'pin'
  | 'unpin'
  | 'resolve_start'
  | 'resolve_success'
  | 'resolve_error'
  | 'clear'
  | 'drag_start'
  | 'drag_end';

/**
 * Namespaced event name string in `popover:<action>` format.
 *
 * @example
 * ```typescript
 * type EventName = PopoverStoreEventName; // 'popover:open_root' | 'popover:close' | ...
 * ```
 */
export type PopoverStoreEventName = `popover:${PopoverEventAction}`;

/**
 * Event object emitted across store lifecycles for analytics, logging, and custom triggers.
 *
 * @template TData - Resolved data payload type.
 *
 * @example
 * ```typescript
 * function handleEvent(event: PopoverStoreEvent<UserData>) {
 *   if (event.type === 'popover:resolve_success' || event.type === 'resolve_success') {
 *     console.log('Card data resolved:', event.key, event.data);
 *   }
 * }
 * ```
 */
export type PopoverStoreEvent<TData = unknown> =
  | { type: 'open_root' | 'popover:open_root'; key: string; ownerId: string }
  | { type: 'push_nested' | 'popover:push_nested'; key: string; parentKey?: string }
  | { type: 'close' | 'popover:close'; keys: string[]; key?: string }
  | { type: 'pin' | 'popover:pin'; key: string }
  | { type: 'unpin' | 'popover:unpin'; key: string }
  | { type: 'resolve_start' | 'popover:resolve_start'; key: string }
  | { type: 'resolve_success' | 'popover:resolve_success'; key: string; data: TData }
  | { type: 'resolve_error' | 'popover:resolve_error'; key: string; error: Error }
  | { type: 'clear' | 'popover:clear' }
  | { type: 'drag_start' | 'popover:drag_start'; key: string; x: number; y: number }
  | { type: 'drag_end' | 'popover:drag_end'; key: string; x: number; y: number };

/**
 * Mapped type index associating each event action name to its exact event payload structure.
 */
export type PopoverStoreEventMap<TData = unknown> = {
  [E in PopoverStoreEvent<TData> as E['type']]: E;
};

/**
 * Dictionary mapping custom listener callbacks to popover store events.
 */
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
