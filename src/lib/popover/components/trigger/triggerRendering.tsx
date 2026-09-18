/**
 * DOM and Render Prop Composition Helpers for PopoverTrigger.
 *
 * @module components/trigger/triggerRendering
 */

import React from 'react';
import { clsx } from '../../utils/clsx';
import { isRecordObject } from '../../utils/typeGuards';
import { noop } from '../../utils/functional';
import type { PopoverTriggerChildProps } from './types';

export function composeEventHandlers<E extends React.SyntheticEvent>(
  handlerA?: (e: E) => void,
  handlerB?: (e: E) => void,
): (e: E) => void {
  if (!handlerA) return handlerB ?? noop;
  if (!handlerB) return handlerA;
  return (e: E) => {
    handlerA(e);
    handlerB(e);
  };
}

export function invokeEventHandlers<E extends React.SyntheticEvent>(
  e: E,
  handlerA?: (e: E) => void,
  handlerB?: (e: E) => void,
): void {
  handlerA?.(e);
  handlerB?.(e);
}

export function useComposedTriggerHandlers(
  triggerProps: React.DOMAttributes<HTMLElement>,
  childProps?: React.DOMAttributes<HTMLElement>,
) {
  const {
    onClick: triggerClick,
    onMouseEnter: triggerMouseEnter,
    onMouseLeave: triggerMouseLeave,
    onKeyDown: triggerKeyDown,
    onFocus: triggerFocus,
  } = triggerProps;
  const {
    onClick: childClick,
    onMouseEnter: childMouseEnter,
    onMouseLeave: childMouseLeave,
    onKeyDown: childKeyDown,
    onFocus: childFocus,
  } = childProps ?? {};

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      invokeEventHandlers(e, triggerClick, childClick);
    },
    [triggerClick, childClick],
  );

  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      invokeEventHandlers(e, triggerMouseEnter, childMouseEnter);
    },
    [triggerMouseEnter, childMouseEnter],
  );

  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      invokeEventHandlers(e, triggerMouseLeave, childMouseLeave);
    },
    [triggerMouseLeave, childMouseLeave],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      invokeEventHandlers(e, triggerKeyDown, childKeyDown);
    },
    [triggerKeyDown, childKeyDown],
  );

  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      invokeEventHandlers(e, triggerFocus, childFocus);
    },
    [triggerFocus, childFocus],
  );

  return { onClick, onMouseEnter, onMouseLeave, onKeyDown, onFocus };
}

export function extractChildProps(child: React.ReactElement | null): Record<string, unknown> {
  if (child && isRecordObject(child.props)) {
    return { ...child.props };
  }
  return {};
}

export function renderFunctionChild(
  children: (props: PopoverTriggerChildProps) => React.ReactNode,
  triggerProps: Record<string, unknown>,
  isOpen: boolean,
  activeClassName?: string,
  mergedRef?: React.Ref<HTMLElement>,
) {
  const rawControls = triggerProps['aria-controls'];
  const ariaControls = typeof rawControls === 'string' ? rawControls : '';
  const rawClassName = triggerProps.className;
  const className =
    clsx(typeof rawClassName === 'string' ? rawClassName : '', isOpen && activeClassName) ||
    undefined;

  const fullProps: PopoverTriggerChildProps = {
    ...triggerProps,
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    'aria-controls': ariaControls,
    className,
    ref: mergedRef,
  };
  return children(fullProps);
}

export function renderElementChild(
  validChild: React.ReactElement,
  triggerProps: Record<string, unknown>,
  isOpen: boolean,
  activeClassName?: string,
  handlers?: Record<string, unknown>,
  mergedRef?: React.Ref<HTMLElement>,
) {
  const childProps = extractChildProps(validChild);
  const rawClassName = childProps.className;
  const className =
    clsx(typeof rawClassName === 'string' ? rawClassName : undefined, isOpen && activeClassName) ||
    undefined;

  const mergedProps = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    ...triggerProps,
    ...childProps,
    className,
    ...handlers,
    ref: mergedRef,
  };

  return React.cloneElement(validChild, mergedProps);
}
