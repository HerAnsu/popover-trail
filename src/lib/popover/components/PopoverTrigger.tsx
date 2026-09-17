/**
 * Declarative Headless Trigger Component for Popover Stack Spawning and Cascading.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Provides accessible click, hover, and keyboard event handlers to toggle or cascade popovers.
 * Automatically determines whether it acts as a root trigger or a nested child trigger
 * based on contextual popover ancestry.
 *
 * @example
 * ```tsx
 * // Simple button trigger
 * <PopoverTrigger popoverKey="profile-menu" placement="bottom-start">
 *   <button type="button">Open Profile</button>
 * </PopoverTrigger>
 * ```
 *
 * @example
 * ```tsx
 * // Render prop with dynamic ARIA attributes
 * <PopoverTrigger popoverKey="user-card">
 *   {(props) => (
 *     <button type="button" {...props}>
 *       User Details {props['aria-expanded'] ? '▲' : '▼'}
 *     </button>
 *   )}
 * </PopoverTrigger>
 * ```
 *
 * @module components/PopoverTrigger
 */

import { useContext, useMemo } from 'react';
import { PopoverCardContext } from '../context/PopoverCardContext';
import { usePopoverIsOpen } from '../hooks/usePopoverSelectors';
import {
  validatePopoverKey,
  validatePlacement,
  validateHoverDelays,
  validateCascadeAncestry,
} from '../utils/devWarnings';
import type { PopoverTriggerProps } from './trigger/types';
import { RootTriggerInner, NestedTriggerInner } from './trigger/TriggerInners';

export type {
  PopoverTriggerChildProps,
  BasePopoverTriggerProps,
  RootPopoverTriggerProps,
  NestedPopoverTriggerProps,
  PopoverTriggerProps,
} from './trigger/types';

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
  const isOpen = usePopoverIsOpen(popoverKey);

  const mergedOptions = useMemo(
    () => ({ placement, offset, ...options }),
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
