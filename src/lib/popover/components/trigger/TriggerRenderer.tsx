/**
 * TriggerRenderer component combining node ref merging and child delegation.
 *
 * @module components/trigger/TriggerRenderer
 */

import React, { useRef, useEffect } from 'react';
import { useMergedRef } from '../../hooks/useHookUtils';
import { TriggerRegistry } from '../../utils/triggerRegistry';
import type { PopoverTriggerChildProps } from './types';
import {
  useComposedTriggerHandlers,
  extractChildProps,
  renderFunctionChild,
  renderElementChild,
} from './triggerRendering';

export interface TriggerRendererProps {
  popoverKey: string;
  triggerProps: Record<string, unknown>;
  isOpen: boolean;
  activeClassName?: string;
  asChild?: boolean;
  children: React.ReactElement | ((props: PopoverTriggerChildProps) => React.ReactNode);
}

/**
 * Shared rendering logic for trigger components. Clones the child element
 * or delegates to a render prop with merged trigger props, className, and event handlers.
 */
export function TriggerRenderer({
  popoverKey,
  triggerProps,
  isOpen,
  activeClassName,
  children,
}: TriggerRendererProps) {
  const isFunctionChild = typeof children === 'function';
  const validChild = isFunctionChild ? null : React.Children.only(children);
  const childRef = React.isValidElement<{ ref?: React.Ref<HTMLElement> }>(validChild)
    ? validChild.props.ref
    : undefined;
  const childProps = extractChildProps(validChild);
  const nodeRef = useRef<HTMLElement | null>(null);
  const handlers = useComposedTriggerHandlers(triggerProps, childProps);
  const mergedRef = useMergedRef(nodeRef, childRef);

  useEffect(() => {
    const el = nodeRef.current;
    if (el) {
      TriggerRegistry.register(popoverKey, el);
    }
    return () => {
      TriggerRegistry.unregister(popoverKey);
    };
  }, [popoverKey]);

  if (typeof children === 'function') {
    return renderFunctionChild(children, triggerProps, isOpen, activeClassName, mergedRef);
  }

  if (validChild) {
    return renderElementChild(
      validChild,
      triggerProps,
      isOpen,
      activeClassName,
      handlers,
      mergedRef,
    );
  }

  return null;
}
