import React, { useContext, type ReactNode } from 'react';
import { PopoverCardContext, usePopoverTrigger, usePopoverNestedTrigger, useIsPopoverOpen } from '../context';
import type { OpenRootOptions, OpenNestedOptions, PopoverPlacement } from '../types';

/**
 * Prop types for the `<PopoverTrigger>` component.
 */
export interface PopoverTriggerProps {
  /** The unique key of the popover card that this trigger opens. */
  popoverKey: string;
  /** Layout placement direction preference relative to the trigger. */
  placement?: PopoverPlacement;
  /** Custom distance gap offset override from trigger in pixels. */
  offset?: number;
  /** Extra trigger options configuration. */
  options?: Omit<OpenRootOptions | OpenNestedOptions, 'placement' | 'offset'>;
  /** CSS class to apply to the child element when the popover is active. */
  activeClassName?: string;
  /** Exactly one React element child to wrap. */
  children: ReactNode;
}

/**
 * Component-based trigger wrapper that declutters layout code.
 * Detects context automatically to bind either root or nested triggers,
 * and manages active class name injection.
 */
export function PopoverTrigger({
  popoverKey,
  placement,
  offset,
  options,
  activeClassName,
  children,
}: PopoverTriggerProps) {
  const parentKey = useContext(PopoverCardContext);
  const isOpen = useIsPopoverOpen(popoverKey);

  const mergedOptions = {
    placement,
    offset,
    ...options,
  };

  // If we are inside an active Popover card context, we are a nested trigger.
  const triggerProps = parentKey
    ? usePopoverNestedTrigger(popoverKey, parentKey, mergedOptions as OpenNestedOptions)
    : usePopoverTrigger(popoverKey, mergedOptions as OpenRootOptions);

  const child = React.Children.only(children) as React.ReactElement<Record<string, unknown>>;

  const combinedClassName = [
    child.props.className,
    isOpen ? activeClassName : '',
  ]
    .filter(Boolean)
    .join(' ');

  return React.cloneElement(child, {
    ...triggerProps,
    ...child.props,
    className: combinedClassName || undefined,
    onClick: (e: React.MouseEvent<HTMLElement>) => {
      triggerProps.onClick?.(e);
      if (typeof child.props.onClick === 'function') {
        child.props.onClick(e);
      }
    },
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => {
      triggerProps.onMouseEnter?.(e);
      if (typeof child.props.onMouseEnter === 'function') {
        child.props.onMouseEnter(e);
      }
    },
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => {
      triggerProps.onMouseLeave?.();
      if (typeof child.props.onMouseLeave === 'function') {
        child.props.onMouseLeave(e);
      }
    },
  });
}
