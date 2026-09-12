/**
 * React Polymorphism, Ref & Synthetic Event Type Guards.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module utils/guards/reactGuards
 */

import * as React from 'react';

/**
 * Type guard checking if `children` is a Render Prop function taking `scope` context.
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
 */
export function isReactRefObject<T = unknown>(ref: unknown): ref is MutableRefLike<T> {
  return typeof ref === 'object' && ref !== null && 'current' in ref;
}

export interface HasRefProp<T> {
  ref?: React.Ref<T>;
}

export function hasRefProperty<T>(val: unknown): val is HasRefProp<T> {
  return typeof val === 'object' && val !== null && 'ref' in val;
}

/**
 * Safely extracts a ref from a ReactElement across React 18 and React 19 representations.
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
