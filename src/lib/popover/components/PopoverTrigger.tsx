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
  /** Exactly one React element child to wrap. */
  children: React.ReactElement;
}

/**
 * Shared rendering logic for trigger components. Clones the child element
 * with the merged trigger props, className, and event handlers.
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
  children: React.ReactElement;
}) {
  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

  const combinedClassName = clsx(child.props.className as string, isOpen && activeClassName);

  const triggerOnClick = triggerProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  const childOnClick = child.props.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  const onClick = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnClick?.(e);
      childOnClick?.(e);
    },
    [triggerOnClick, childOnClick],
  );

  const triggerOnMouseEnter = triggerProps.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  const childOnMouseEnter = child.props.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  const onMouseEnter = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnMouseEnter?.(e);
      childOnMouseEnter?.(e);
    },
    [triggerOnMouseEnter, childOnMouseEnter],
  );

  const triggerOnMouseLeave = triggerProps.onMouseLeave as (() => void) | undefined;
  const childOnMouseLeave = child.props.onMouseLeave as ((e: React.MouseEvent<HTMLElement>) => void) | undefined;
  const onMouseLeave = React.useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      triggerOnMouseLeave?.();
      childOnMouseLeave?.(e);
    },
    [triggerOnMouseLeave, childOnMouseLeave],
  );

  const triggerOnKeyDown = triggerProps.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined;
  const childOnKeyDown = child.props.onKeyDown as ((e: React.KeyboardEvent<HTMLElement>) => void) | undefined;
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      triggerOnKeyDown?.(e);
      childOnKeyDown?.(e);
    },
    [triggerOnKeyDown, childOnKeyDown],
  );

  const triggerOnFocus = triggerProps.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined;
  const childOnFocus = child.props.onFocus as ((e: React.FocusEvent<HTMLElement>) => void) | undefined;
  const onFocus = React.useCallback(
    (e: React.FocusEvent<HTMLElement>) => {
      triggerOnFocus?.(e);
      childOnFocus?.(e);
    },
    [triggerOnFocus, childOnFocus],
  );

  return React.cloneElement(child, {
    'aria-haspopup': 'dialog',
    'aria-expanded': isOpen,
    ...triggerProps,
    ...child.props,
    className: combinedClassName || undefined,
    onClick,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
    onFocus,
  });
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
  children,
}: {
  popoverKey: string;
  mergedOptions: OpenRootOptions;
  isOpen: boolean;
  activeClassName?: string;
  children: React.ReactElement;
}) {
  const triggerProps = usePopoverTrigger(popoverKey, mergedOptions);
  return (
    <TriggerRenderer triggerProps={triggerProps} isOpen={isOpen} activeClassName={activeClassName}>
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
  children,
}: {
  popoverKey: string;
  parentKey: string;
  mergedOptions: OpenNestedOptions;
  isOpen: boolean;
  activeClassName?: string;
  children: React.ReactElement;
}) {
  const triggerProps = usePopoverNestedTrigger(popoverKey, parentKey, mergedOptions);
  return (
    <TriggerRenderer triggerProps={triggerProps} isOpen={isOpen} activeClassName={activeClassName}>
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
        activeClassName={activeClassName}>
        {children}
      </NestedTriggerInner>
    );
  }

  return (
    <RootTriggerInner
      popoverKey={popoverKey}
      mergedOptions={mergedOptions as OpenRootOptions}
      isOpen={isOpen}
      activeClassName={activeClassName}>
      {children}
    </RootTriggerInner>
  );
}
