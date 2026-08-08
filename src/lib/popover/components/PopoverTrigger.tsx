import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { clsx } from '../utils/storeHelpers';
import { useMergedRef } from '../hooks/useHookUtils';
import { TriggerRegistry } from '../utils/triggerRegistry';
import {
  PopoverCardContext,
  usePopoverTrigger,
  usePopoverNestedTrigger,
  useIsPopoverOpen,
} from '../context';
import type { OpenRootOptions, OpenNestedOptions, PopoverPlacement } from '../types';
import {
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
  validateCascadeAncestry,
} from '../utils/devWarnings';

/**
 * Combined event handlers and accessibility attributes passed to custom trigger render props.
 */
export interface PopoverTriggerChildProps extends Record<string, unknown> {
  'aria-haspopup': 'dialog';
  'aria-expanded': boolean;
  'aria-controls': string;
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  ref?: React.Ref<HTMLElement>;
}

/** Base prop types for the `<PopoverTrigger>` component. */
export interface BasePopoverTriggerProps<TPopoverKey extends string = string> {
  /** The unique key of the popover card that this trigger opens. */
  popoverKey: TPopoverKey;
  /** Layout placement direction preference relative to the trigger. */
  placement?: PopoverPlacement;
  /** Custom distance gap offset override from trigger in pixels. */
  offset?: number;
  /** Extra trigger options configuration. */
  options?: Omit<OpenRootOptions | OpenNestedOptions, 'placement' | 'offset'>;
  /** CSS class to apply to the child element when the popover is active. */
  activeClassName?: string;
  /** If true, passes trigger props to child without forcing cloneElement mutations. */
  asChild?: boolean;
  /** React element child or render prop callback function. */
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}

/** Prop types for a Root Trigger (spawns a new trail stack). */
export interface RootPopoverTriggerProps<
  TPopoverKey extends string = string,
> extends BasePopoverTriggerProps<TPopoverKey> {
  /** Root triggers cannot specify a parentKey. */
  parentKey?: never;
}

/** Prop types for a Nested Child Trigger (pushes child popover onto parent stack). */
export interface NestedPopoverTriggerProps<
  TPopoverKey extends string = string,
> extends BasePopoverTriggerProps<TPopoverKey> {
  /** The parent popover key that spawned this nested trigger. */
  parentKey: string;
}

/** Discriminated union representation of PopoverTriggerProps. */
export type PopoverTriggerProps<TPopoverKey extends string = string> =
  | RootPopoverTriggerProps<TPopoverKey>
  | NestedPopoverTriggerProps<TPopoverKey>;

function composeEventHandlers<E extends React.SyntheticEvent>(
  handlerA?: (e: E) => void,
  handlerB?: (e: E) => void,
): (e: E) => void {
  return (e: E) => {
    handlerA?.(e);
    handlerB?.(e);
  };
}

/**
 * Shared rendering logic for trigger components. Clones the child element
 * or delegates to a render prop with merged trigger props, className, and event handlers.
 */
function TriggerRenderer({
  popoverKey,
  triggerProps,
  isOpen,
  activeClassName,
  children,
}: {
  popoverKey: string;
  triggerProps: Record<string, unknown>;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}) {
  const isFunctionChild = typeof children === 'function';
  const child = isFunctionChild
    ? null
    : (React.Children.only(children) as React.ReactElement<Record<string, unknown>>);

  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        child?.props.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onClick, child?.props.onClick],
  );

  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        child?.props.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onMouseEnter, child?.props.onMouseEnter],
  );

  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onMouseLeave as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        child?.props.onMouseLeave as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onMouseLeave, child?.props.onMouseLeave],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined,
        child?.props.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onKeyDown, child?.props.onKeyDown],
  );

  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined,
        child?.props.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onFocus, child?.props.onFocus],
  );

  const nodeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = nodeRef.current;
    if (el) {
      TriggerRegistry.register(popoverKey, el);
    }
    return () => {
      TriggerRegistry.unregister(popoverKey);
    };
  }, [popoverKey]);

  const childRef =
    typeof children !== 'function' && React.isValidElement(children)
      ? (children as React.ReactElement<Record<string, unknown>> & { ref?: React.Ref<unknown> }).ref
      : undefined;
  const mergedRef = useMergedRef(nodeRef, childRef);

  if (typeof children === 'function') {
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

  const validChild = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

  const mergedProps = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    ...triggerProps,
    ...validChild.props,
    className:
      clsx(
        typeof validChild.props.className === 'string' ? validChild.props.className : undefined,
        isOpen && activeClassName,
      ) || undefined,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onFocus,
    ref: mergedRef,
  };

  return React.cloneElement(validChild, mergedProps);
}

/**
 * Internal component for root-level triggers. Calls `usePopoverTrigger`
 * unconditionally to comply with the Rules of Hooks.
 */
function RootTriggerInner({
  popoverKey,
  mergedOptions,
  isOpen,
  activeClassName,
  asChild,
  children,
}: {
  popoverKey: string;
  mergedOptions: OpenRootOptions;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}) {
  const triggerProps = usePopoverTrigger(popoverKey, mergedOptions);
  return (
    <TriggerRenderer
      popoverKey={popoverKey}
      triggerProps={triggerProps}
      isOpen={isOpen}
      activeClassName={activeClassName}
      asChild={asChild}>
      {children}
    </TriggerRenderer>
  );
}

/**
 * Internal component for nested triggers inside an active popover card.
 * Calls `usePopoverNestedTrigger` unconditionally to comply with the Rules of Hooks.
 */
function NestedTriggerInner({
  popoverKey,
  parentKey,
  mergedOptions,
  isOpen,
  activeClassName,
  asChild,
  children,
}: {
  popoverKey: string;
  parentKey: string;
  mergedOptions: OpenNestedOptions;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}) {
  const triggerProps = usePopoverNestedTrigger(popoverKey, parentKey, mergedOptions);
  return (
    <TriggerRenderer
      popoverKey={popoverKey}
      triggerProps={triggerProps}
      isOpen={isOpen}
      activeClassName={activeClassName}
      asChild={asChild}>
      {children}
    </TriggerRenderer>
  );
}

/**
 * Component-based trigger wrapper that declutters layout code.
 * Detects context automatically to bind either root or nested triggers,
 * and manages active class name injection.
 *
 * @template TPopoverKey - Union of valid popover keys.
 */
export function PopoverTrigger<TPopoverKey extends string = string>({
  popoverKey,
  placement,
  offset,
  options,
  activeClassName,
  asChild,
  children,
}: PopoverTriggerProps<TPopoverKey>) {
  const parentKey = useContext(PopoverCardContext);

  validatePopoverKey(popoverKey);
  validatePlacement(placement);
  validateHoverDelays(options?.hover?.openDelay, options?.hover?.closeDelay);
  validateCascadeAncestry(popoverKey, parentKey);
  const isOpen = useIsPopoverOpen(popoverKey);

  const mergedOptions = useMemo(
    () => ({
      placement,
      offset,
      ...options,
    }),
    [placement, offset, options],
  );

  if (parentKey) {
    return (
      <NestedTriggerInner
        popoverKey={popoverKey}
        parentKey={parentKey}
        mergedOptions={mergedOptions}
        isOpen={isOpen}
        activeClassName={activeClassName}
        asChild={asChild}>
        {children}
      </NestedTriggerInner>
    );
  }

  return (
    <RootTriggerInner
      popoverKey={popoverKey}
      mergedOptions={mergedOptions}
      isOpen={isOpen}
      activeClassName={activeClassName}
      asChild={asChild}>
      {children}
    </RootTriggerInner>
  );
}
