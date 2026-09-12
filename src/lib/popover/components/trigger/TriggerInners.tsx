/**
 * Internal Root and Nested Trigger Container Components.
 *
 * @module components/trigger/TriggerInners
 */

import React from 'react';
import { usePopoverTrigger, usePopoverNestedTrigger } from '../../hooks/usePopoverTriggers';
import type { OpenRootOptions, OpenNestedOptions } from '../../types';
import type { PopoverTriggerChildProps } from './types';
import { TriggerRenderer } from './TriggerRenderer';

/**
 * Internal component for root-level triggers. Calls `usePopoverTrigger`
 * unconditionally to comply with the Rules of Hooks.
 */
export function RootTriggerInner({
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
export function NestedTriggerInner({
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
