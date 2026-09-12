/**
 * Type Guards and Pattern Matchers for PopoverStoreEvent.
 * Clean Architecture Layer 2: Headless State Management & Events.
 *
 * @module utils/guards/eventGuards
 */

import {
  type PopoverStoreEvent,
  type PopoverEventAction,
  POPOVER_EVENT_ACTIONS,
} from '../../types/eventTypes';
import { isPlainObject } from './objectGuards';

export * from './eventLifecycleGuards';

const STORE_EVENT_TYPES: ReadonlySet<string> = new Set<string>(
  POPOVER_EVENT_ACTIONS.flatMap((action) => [action, `popover:${action}` as const]),
);

/** Validates that an unknown candidate is a PopoverStoreEvent. */
export function isPopoverStoreEvent<TData = unknown, TPopoverKey extends string = string>(
  val: unknown,
): val is PopoverStoreEvent<TData, TPopoverKey> {
  return isPlainObject(val) && typeof val.type === 'string' && STORE_EVENT_TYPES.has(val.type);
}

/** Internal predicate matching a PopoverStoreEvent against an action name. */
function matchesEventAction<TData, TPopoverKey extends string, A extends PopoverEventAction>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
  action: A,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: A | `popover:${A}` }> {
  return event.type === action || event.type === `popover:${action}`;
}

/** Type guard for 'open_root' event. */
export function isOpenRootEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
  { type: 'open_root' | 'popover:open_root' }
> {
  return matchesEventAction(event, 'open_root');
}

/** Type guard for 'push_nested' event. */
export function isPushNestedEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
  { type: 'push_nested' | 'popover:push_nested' }
> {
  return matchesEventAction(event, 'push_nested');
}

/** Type guard for 'close' event. */
export function isCloseEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'close' | 'popover:close' }> {
  return matchesEventAction(event, 'close');
}

/** Type guard for 'pin' event. */
export function isPinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'pin' | 'popover:pin' }> {
  return matchesEventAction(event, 'pin');
}

/** Type guard for 'unpin' event. */
export function isUnpinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'unpin' | 'popover:unpin' }> {
  return matchesEventAction(event, 'unpin');
}

/** Type guard for 'clear' event. */
export function isClearEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'clear' | 'popover:clear' }> {
  return matchesEventAction(event, 'clear');
}

/** Generic type guard narrowing a `PopoverStoreEvent` to a specific event type. */
export function isStoreEvent<
  TData = unknown,
  TType extends PopoverStoreEvent<TData>['type'] = PopoverStoreEvent<TData>['type'],
>(
  event: PopoverStoreEvent<TData>,
  type: TType,
): event is Extract<PopoverStoreEvent<TData>, { type: TType }> {
  return (
    event.type === type || event.type === `popover:${type}` || `popover:${event.type}` === type
  );
}
