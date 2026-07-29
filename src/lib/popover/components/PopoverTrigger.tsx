import React, { useContext, useMemo } from 'react';
import { clsx } from '../utils/storeHelpers';
import {
  PopoverCardContext,
  usePopoverTrigger,
  usePopoverNestedTrigger,
  useIsPopoverOpen,
} from '../context';
import type { OpenRootOptions, OpenNestedOptions, PopoverPlacement } from '../types';

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
}

/**
 * Prop types for the `<PopoverTrigger>` component.
 *
 * @template TPopoverKey - Union of valid popover keys.
 */
export interface PopoverTriggerProps<TPopoverKey extends string = string> {
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

/**
 * Shared rendering logic for trigger components. Clones the child element
 * or delegates to a render prop with merged trigger props, className, and event handlers.
 */
function TriggerRenderer({
  triggerProps,
  isOpen,
  activeClassName,
  children,
}: {
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

  const triggerOnClick = triggerProps.onClick as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const childOnClick = child?.props.onClick as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnClick?.(e);
      childOnClick?.(e);
    },
    [triggerOnClick, childOnClick],
  );

  const triggerOnMouseEnter = triggerProps.onMouseEnter as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const childOnMouseEnter = child?.props.onMouseEnter as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnMouseEnter?.(e);
      childOnMouseEnter?.(e);
    },
    [triggerOnMouseEnter, childOnMouseEnter],
  );

  const triggerOnMouseLeave = triggerProps.onMouseLeave as (() => void) | undefined;
  const childOnMouseLeave = child?.props.onMouseLeave as
    | ((e: React.MouseEvent<HTMLElement>) => void)
    | undefined;
  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnMouseLeave?.();
      childOnMouseLeave?.(e);
    },
    [triggerOnMouseLeave, childOnMouseLeave],
  );

  const triggerOnKeyDown = triggerProps.onKeyDown as
    | ((e: React.KeyboardEvent<HTMLElement>) => void)
    | undefined;
  const childOnKeyDown = child?.props.onKeyDown as
    | ((e: React.KeyboardEvent<HTMLElement>) => void)
    | undefined;
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      triggerOnKeyDown?.(e);
      childOnKeyDown?.(e);
    },
    [triggerOnKeyDown, childOnKeyDown],
  );

  const triggerOnFocus = triggerProps.onFocus as
    | ((e: React.FocusEvent<HTMLElement>) => void)
    | undefined;
  const childOnFocus = child?.props.onFocus as
    | ((e: React.FocusEvent<HTMLElement>) => void)
    | undefined;
  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      triggerOnFocus?.(e);
      childOnFocus?.(e);
    },
    [triggerOnFocus, childOnFocus],
  );

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
    };
    return children(fullProps);
  }

  const validChild = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

  const mergedProps = {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    ...triggerProps,
    ...validChild.props,
    className: clsx(validChild.props.className as string, isOpen && activeClassName) || undefined,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onFocus,
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
import {
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
  validateCascadeAncestry,
} from '../utils/devWarnings';

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

  // Delegate to separate sub-components so each hook is called unconditionally (Rules of Hooks).
  if (parentKey) {
    return (
      <NestedTriggerInner
        popoverKey={popoverKey}
        parentKey={parentKey}
        mergedOptions={mergedOptions as OpenNestedOptions}
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
      mergedOptions={mergedOptions as OpenRootOptions}
      isOpen={isOpen}
      activeClassName={activeClassName}
      asChild={asChild}>
      {children}
    </RootTriggerInner>
  );
}
