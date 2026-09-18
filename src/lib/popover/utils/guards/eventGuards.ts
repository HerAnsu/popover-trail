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

/**
 * Validates that an unknown candidate is a PopoverStoreEvent.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param val - Candidate value to evaluate.
 * @returns True if `val` conforms to a valid PopoverStoreEvent.
 *
 * @example
 * ```typescript
 * if (isPopoverStoreEvent(event)) {
 *   console.log(event.type, event.key);
 * }
 * ```
 */
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

/**
 * Type guard for 'open_root' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'open_root'.
 *
 * @example
 * ```typescript
 * if (isOpenRootEvent(event)) {
 *   console.log('Root opened:', event.key);
 * }
 * ```
 */
export function isOpenRootEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
  { type: 'open_root' | 'popover:open_root' }
> {
  return matchesEventAction(event, 'open_root');
}

/**
 * Type guard for 'push_nested' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'push_nested'.
 *
 * @example
 * ```typescript
 * if (isPushNestedEvent(event)) {
 *   console.log('Nested child opened:', event.key, 'parent:', event.parentKey);
 * }
 * ```
 */
export function isPushNestedEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<
  PopoverStoreEvent<TData, TPopoverKey>,
  { type: 'push_nested' | 'popover:push_nested' }
> {
  return matchesEventAction(event, 'push_nested');
}

/**
 * Type guard for 'close' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'close'.
 *
 * @example
 * ```typescript
 * if (isCloseEvent(event)) {
 *   console.log('Closed popover:', event.key);
 * }
 * ```
 */
export function isCloseEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'close' | 'popover:close' }> {
  return matchesEventAction(event, 'close');
}

/**
 * Type guard for 'pin' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'pin'.
 *
 * @example
 * ```typescript
 * if (isPinEvent(event)) {
 *   console.log('Pinned card:', event.key);
 * }
 * ```
 */
export function isPinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'pin' | 'popover:pin' }> {
  return matchesEventAction(event, 'pin');
}

/**
 * Type guard for 'unpin' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'unpin'.
 *
 * @example
 * ```typescript
 * if (isUnpinEvent(event)) {
 *   console.log('Unpinned card:', event.key);
 * }
 * ```
 */
export function isUnpinEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'unpin' | 'popover:unpin' }> {
  return matchesEventAction(event, 'unpin');
}

/**
 * Type guard for 'clear' event.
 *
 * @template TData - Event payload data type.
 * @template TPopoverKey - Popover key identifier type.
 * @param event - Candidate store event.
 * @returns True if event is 'clear'.
 *
 * @example
 * ```typescript
 * if (isClearEvent(event)) {
 *   console.log('Cleared all active cards');
 * }
 * ```
 */
export function isClearEvent<TData = unknown, TPopoverKey extends string = string>(
  event: PopoverStoreEvent<TData, TPopoverKey>,
): event is Extract<PopoverStoreEvent<TData, TPopoverKey>, { type: 'clear' | 'popover:clear' }> {
  return matchesEventAction(event, 'clear');
}

/**
 * Generic type guard narrowing a `PopoverStoreEvent` to a specific event type.
 *
 * @template TData - Event payload data type.
 * @template TType - Specific event type string.
 * @param event - Candidate store event.
 * @param type - Target event type to check against.
 * @returns True if event matches `type`.
 *
 * @example
 * ```typescript
 * if (isStoreEvent(event, 'pin')) {
 *   console.log('Pin event:', event.key);
 * }
 * ```
 */
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
