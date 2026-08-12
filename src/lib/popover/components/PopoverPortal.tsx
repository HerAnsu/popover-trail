import React, { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePopoverFloating, usePopoverTrail } from '../context';
import type { TrailEntry } from '../types';
import { validatePortalContainer } from '../utils/devWarnings';

export interface PopoverPortalProps {
  /** React elements or render prop callback function. */
  children: ReactNode | ((entries: Array<TrailEntry & { isPinned: boolean }>) => ReactNode);
  /** Optional custom DOM element target. Defaults to document.body. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

/**
 * Portal wrapper component that safely mounts children elements to `document.body`,
 * bypassing parent `overflow: hidden` layouts and clipping issues.
 * Supports direct ReactNode elements or render-prop functions receiving formatted entries.
 *
 * @param props - Portal configuration props.
 * @returns The portal element.
 */
export function PopoverPortal({ children, container }: PopoverPortalProps) {
  const [mounted, setMounted] = useState(false);
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const formattedEntries = React.useMemo(() => {
    if (typeof children !== 'function') return null;
    const result: Array<TrailEntry & { isPinned: boolean }> = [];
    for (let i = 0; i < floating.length; i++) {
      const entry = floating[i];
      if (entry) {
        result.push({ ...entry, isPinned: true });
      }
    }
    for (let i = 0; i < trail.length; i++) {
      const entry = trail[i];
      if (entry) {
        result.push({ ...entry, isPinned: false });
      }
    }
    return result;
  }, [children, floating, trail]);

  if (!mounted) return null;

  let target: HTMLElement | null = null;
  if (container) {
    if (typeof container === 'function') {
      target = container();
    } else if ('current' in container) {
      target = container.current;
    } else {
      target = container;
    }
    validatePortalContainer(target);
  }

  const renderedContent =
    typeof children === 'function'
      ? formattedEntries
        ? children(formattedEntries)
        : null
      : children;

  return createPortal(renderedContent, target ?? document.body);
}
