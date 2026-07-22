import React, { useContext, useMemo } from 'react';
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

  const combinedClassName = [child.props.className, isOpen ? activeClassName : '']
    .filter(Boolean)
    .join(' ');

  return React.cloneElement(child, {
    ...triggerProps,
    ...child.props,
    className: combinedClassName || undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      (triggerProps.onClick as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      if (typeof child.props.onClick === 'function') {
        child.props.onClick(e);
      }
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      (triggerProps.onMouseEnter as ((e: React.MouseEvent<HTMLElement>) => void) | undefined)?.(e);
      if (typeof child.props.onMouseEnter === 'function') {
        child.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      (triggerProps.onMouseLeave as (() => void) | undefined)?.();
      if (typeof child.props.onMouseLeave === 'function') {
        child.props.onMouseLeave(e);
      }
    },
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
export function PopoverTrigger<TPopoverKey extends string = string>({
  popoverKey,
  placement,
  offset,
  options,
  activeClassName,
  children,
}: PopoverTriggerProps<TPopoverKey>) {
  const parentKey = useContext(PopoverCardContext);
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
