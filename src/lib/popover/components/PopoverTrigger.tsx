import React, { useContext, useMemo, useRef, useEffect } from 'react';
import { clsx } from '../utils/clsx';
import { useMergedRef } from '../hooks/useHookUtils';
import { TriggerRegistry } from '../utils/triggerRegistry';
import { PopoverCardContext } from '../context/PopoverCardContext';
import { usePopoverTrigger, usePopoverNestedTrigger } from '../hooks/usePopoverTriggers';
import { useIsPopoverOpen } from '../hooks/usePopoverSelectors';
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
  /** ARIA popup role declaration ('dialog'). */
  'aria-haspopup': 'dialog';
  /** Whether the associated popover card is currently open. */
  'aria-expanded': boolean;
  /** HTML id of the controlled popover card. */
  'aria-controls': string;
  /** Click event handler triggering popover toggle. */
  onClick?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Pointer enter handler for hover-delayed opening. */
  onMouseEnter?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Pointer leave handler for hover-delayed closing. */
  onMouseLeave?: (e: React.MouseEvent<HTMLElement>) => void;
  /** Keyboard handler for Enter/Space activation. */
  onKeyDown?: (e: React.KeyboardEvent<HTMLElement>) => void;
  /** Focus event handler. */
  onFocus?: (e: React.FocusEvent<HTMLElement>) => void;
  /** Forwarded ref for element anchoring and positioning. */
  ref?: React.Ref<HTMLElement>;
}

/** Base prop types for the `<PopoverTrigger>` component. */
export interface BasePopoverTriggerProps<TPopoverKey extends string = string> {
  /** The unique key of the popover card that this trigger opens. */
  popoverKey: TPopoverKey;
  /** Layout placement direction preference relative to the trigger (e.g. 'right', 'bottom-start'). */
  placement?: PopoverPlacement;
  /** Custom distance gap offset override from trigger in pixels. */
  offset?: number;
  /** Extra trigger options configuration (hover delays, boundary collision behavior). */
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

function useComposedTriggerHandlers(
  triggerProps: Record<string, unknown>,
  childProps?: Record<string, unknown>,
) {
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        childProps?.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onClick, childProps?.onClick],
  );

  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        childProps?.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onMouseEnter, childProps?.onMouseEnter],
  );

  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onMouseLeave as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
        childProps?.onMouseLeave as ((e: React.MouseEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onMouseLeave, childProps?.onMouseLeave],
  );

  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined,
        childProps?.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onKeyDown, childProps?.onKeyDown],
  );

  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      composeEventHandlers(
        triggerProps.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined,
        childProps?.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined,
      )(e);
    },
    [triggerProps.onFocus, childProps?.onFocus],
  );

  return { onClick, onMouseEnter, onMouseLeave, onKeyDown, onFocus };
}

function renderFunctionChild(
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

function renderElementChild(
  validChild: React.ReactElement<Record<string, unknown>>,
  triggerProps: Record<string, unknown>,
  isOpen: boolean,
  activeClassName?: string,
  handlers?: Record<string, unknown>,
  mergedRef?: React.Ref<HTMLElement>,
) {
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
    ...handlers,
    ref: mergedRef,
  };

  return React.cloneElement(validChild, mergedProps);
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

  const handlers = useComposedTriggerHandlers(triggerProps, child?.props);
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
    return renderFunctionChild(children, triggerProps, isOpen, activeClassName, mergedRef);
  }

  const validChild = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;
  return renderElementChild(validChild, triggerProps, isOpen, activeClassName, handlers, mergedRef);
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
  const triggerProps = usePopoverTrigger(popoverKey, mergedOptions, isOpen);
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
  const triggerProps = usePopoverNestedTrigger(popoverKey, parentKey, mergedOptions, isOpen);
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
 * Headless trigger wrapper that anchors and toggles popover cards.
 *
 * @remarks
 * Automatically detects whether it is rendered inside an active popover card:
 * - If inside a card, acts as a nested child trigger that pushes cards onto the breadcrumb trail.
 * - If rendered at top-level, acts as a root trigger that starts a new trail cascade.
 *
 * Supports regular React elements (via automatic event handler merging) or render props.
 *
 * @example
 * ```tsx
 * // Standard element child
 * <PopoverTrigger popoverKey="userMenu">
 *   <button type="button">Open User Menu</button>
 * </PopoverTrigger>
 *
 * // Render prop child with custom styling
 * <PopoverTrigger popoverKey="userMenu">
 *   {(props) => (
 *     <button {...props} className={props['aria-expanded'] ? 'active-btn' : 'idle-btn'}>
 *       Menu
 *     </button>
 *   )}
 * </PopoverTrigger>
 * ```
 *
 * @template TPopoverKey - Union of valid popover keys.
 * @param props - Trigger configuration props and child element.
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
