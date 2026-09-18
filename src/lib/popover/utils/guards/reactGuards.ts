/**
 * React Polymorphism, Ref & Synthetic Event Type Guards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module utils/guards/reactGuards
 */

import * as React from 'react';

/**
 * Type guard checking if `children` is a Render Prop function taking `scope` context.
 *
 * @template T - Render prop argument scope type.
 * @param children - Candidate children prop value.
 * @returns True if `children` is a function taking scope context.
 *
 * @example
 * ```tsx
 * if (isRenderProp(children)) {
 *   return children(cardScope);
 * }
 * ```
 */
export function isRenderProp<T = unknown>(
  children: unknown,
): children is (scope: T) => React.ReactNode {
  return typeof children === 'function';
}

export interface MutableRefLike<T> {
  current: T | null;
}

/**
 * Type guard verifying if an unknown reference object is a mutable React ref object.
 *
 * @template T - Current ref element type.
 * @param ref - Candidate ref object.
 * @returns True if `ref` has a `.current` property.
 *
 * @example
 * ```typescript
 * if (isReactRefObject<HTMLElement>(ref)) {
 *   console.log(ref.current);
 * }
 * ```
 */
export function isReactRefObject<T = unknown>(ref: unknown): ref is MutableRefLike<T> {
  return typeof ref === 'object' && ref !== null && 'current' in ref;
}

export interface HasRefProp<T> {
  ref?: React.Ref<T>;
}

/**
 * Type guard verifying if an object contains a `ref` property.
 *
 * @template T - Element type.
 * @param val - Candidate object to inspect.
 * @returns True if `val` contains a `ref` field.
 */
export function hasRefProperty<T>(val: unknown): val is HasRefProp<T> {
  return typeof val === 'object' && val !== null && 'ref' in val;
}

/**
 * Safely extracts a ref from a ReactElement across React 18 and React 19 representations.
 *
 * @template T - Element type.
 * @param element - React element instance.
 * @returns Ref object or function if present, otherwise undefined.
 *
 * @example
 * ```typescript
 * const childRef = extractElementRef<HTMLDivElement>(child);
 * ```
 */
export function extractElementRef<T = HTMLElement>(
  element: React.ReactElement,
): React.Ref<T> | undefined {
  if (hasRefProperty<T>(element.props)) {
    return element.props.ref;
  }
  if (hasRefProperty<T>(element)) {
    return element.ref;
  }
  return undefined;
}

/**
 * Type guard verifying if an unknown event is a React SyntheticEvent.
 *
 * @param e - Candidate event object.
 * @returns True if `e` has `nativeEvent`, `preventDefault`, and `stopPropagation`.
 *
 * @example
 * ```typescript
 * if (isSyntheticEvent(evt)) {
 *   evt.stopPropagation();
 * }
 * ```
 */
export function isSyntheticEvent(e: unknown): e is React.SyntheticEvent {
  return (
    typeof e === 'object' &&
    e !== null &&
    'nativeEvent' in e &&
    'preventDefault' in e &&
    'stopPropagation' in e
  );
}

interface ReactInternals {
  ReactCurrentDispatcher?: { current?: unknown };
  ReactCurrentOwner?: { current?: unknown };
}

/**
 * Checks if the current execution frame is within an active React component render phase.
 *
 * @returns True if React current dispatcher or current owner is populated.
 *
 * @example
 * ```typescript
 * if (!isCurrentlyRenderingInReact()) {
 *   // Safe to execute side-effects or schedule updates
 * }
 * ```
 */
export function isCurrentlyRenderingInReact(): boolean {
  if (typeof React === 'undefined' || !React) return false;
  const internals =
    '__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED' in React
      ? React.__CLIENT_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
      : '__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED' in React
        ? React.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED
        : undefined;

  if (!internals || typeof internals !== 'object') return false;
  const intObj: ReactInternals = internals;
  return Boolean(intObj.ReactCurrentDispatcher?.current || intObj.ReactCurrentOwner?.current);
}
