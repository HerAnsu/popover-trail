/**
 * Accessible Portal Wrapper Component with Isomorphic Hydration.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/PopoverPortal
 */

import React, { useMemo, useSyncExternalStore, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePopoverFloating, usePopoverTrail } from '../hooks/usePopoverSelectors';
import type { TrailEntry } from '../types';
import { resolveContainerElement } from '../utils/componentUtils';
import { isFunction, isBrowser } from '../utils/typeGuards';
import { validatePortalContainer } from '../utils/devWarnings';

export interface PopoverPortalProps {
  children: ReactNode | ((entries: Array<TrailEntry & { isPinned: boolean }>) => ReactNode);
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

const emptySubscribe = () => () => {};

export function PopoverPortal({ children, container }: PopoverPortalProps) {
  const isHydrated = useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  const isRenderProp = isFunction(children);
  const formattedEntries = useMemo(() => {
    if (!isRenderProp) return null;
    const result: Array<TrailEntry & { isPinned: boolean }> = [];
    for (const entry of floating) {
      if (entry) result.push({ ...entry, isPinned: true });
    }
    for (const entry of trail) {
      if (entry) result.push({ ...entry, isPinned: false });
    }
    return result;
  }, [isRenderProp, floating, trail]);

  if (!isHydrated || !isBrowser()) return null;

  const target = resolveContainerElement(container);
  if (container) validatePortalContainer(target);

  const renderedContent =
    typeof children === 'function'
      ? formattedEntries
        ? children(formattedEntries)
        : null
      : children;

  return createPortal(renderedContent, target ?? document.body);
}
