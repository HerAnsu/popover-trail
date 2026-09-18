/**
 * Type Guards for PopoverCard Scope and Context Values.
 * Clean Architecture Layer 3: Reactive Integration & Context.
 *
 * @module context/cardScopeGuards
 */

import type {
  CardStaticScope,
  CardDynamicScope,
  PopoverCardScope,
} from './PopoverCardScopeContext';
import { isPlainObject } from '../utils/guards/objectGuards';

/**
 * Validates whether an unknown value conforms to CardStaticScope.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param val - Unknown value to test.
 * @returns True if `val` is a valid CardStaticScope.
 *
 * @example
 * ```typescript
 * if (isCardStaticScope(scope)) {
 *   console.log(scope.entryKey, scope.index);
 * }
 * ```
 */
export function isCardStaticScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(val: unknown): val is CardStaticScope<TData, TContext, TPopoverKey> {
  return (
    isPlainObject(val) &&
    typeof val.entryKey === 'string' &&
    typeof val.index === 'number' &&
    'entry' in val &&
    isPlainObject(val.entry) &&
    'actions' in val &&
    isPlainObject(val.actions)
  );
}

/**
 * Validates whether an unknown value conforms to CardDynamicScope.
 *
 * @param val - Unknown value to test.
 * @returns True if `val` is a valid CardDynamicScope.
 *
 * @example
 * ```typescript
 * if (isCardDynamicScope(scope)) {
 *   console.log(scope.isPinned, scope.card);
 * }
 * ```
 */
export function isCardDynamicScope(val: unknown): val is CardDynamicScope {
  return (
    isPlainObject(val) &&
    typeof val.isPinned === 'boolean' &&
    'card' in val &&
    isPlainObject(val.card)
  );
}

/**
 * Validates whether an unknown value conforms to full PopoverCardScope.
 *
 * @template TData - Resolved data payload type.
 * @template TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param val - Unknown value to test.
 * @returns True if `val` is a valid PopoverCardScope.
 *
 * @example
 * ```typescript
 * if (isPopoverCardScope(ctx)) {
 *   console.log(ctx.entry.key, ctx.actions);
 * }
 * ```
 */
export function isPopoverCardScope<
  TData = unknown,
  TContext = unknown,
  TPopoverKey extends string = string,
>(val: unknown): val is PopoverCardScope<TData, TContext, TPopoverKey> {
  return (
    isPlainObject(val) &&
    'entry' in val &&
    isPlainObject(val.entry) &&
    typeof val.index === 'number' &&
    typeof val.isPinned === 'boolean' &&
    'card' in val &&
    isPlainObject(val.card) &&
    'actions' in val &&
    isPlainObject(val.actions)
  );
}
