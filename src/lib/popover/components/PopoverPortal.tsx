import React, { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { usePopoverFloating, usePopoverTrail } from '../hooks/usePopoverSelectors';
import type { TrailEntry } from '../types';
import { validatePortalContainer } from '../utils/devWarnings';

/**
 * Props for `<PopoverPortal>`.
 */
export interface PopoverPortalProps {
  /** React elements or a render prop callback function receiving all active popover entries. */
  children: ReactNode | ((entries: Array<TrailEntry & { isPinned: boolean }>) => ReactNode);
  /** Optional custom DOM container element target. Defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

/**
 * Portal wrapper component that safely mounts children elements to `document.body` or a custom container.
 * Bypasses parent `overflow: hidden`, `clip-path`, and CSS transform stacking context limitations.
 *
 * @remarks
 * Safe for SSR: only renders the portal after client-side mounting is verified to avoid hydration mismatches.
 * Supports direct React children or a render prop receiving the combined array of active popovers.
 *
 * @example
 * ```tsx
 * import { PopoverPortal } from 'popover-trail';
 *
 * function App() {
 *   return (
 *     <PopoverPortal>
 *       <div className="floating-layer">...</div>
 *     </PopoverPortal>
 *   );
 * }
 * ```
 *
 * @param props - Portal configuration options and children content.
 * @returns React Portal instance, or null prior to hydration.
 */
export function PopoverPortal({ children, container }: PopoverPortalProps) {
  const [mounted, setMounted] = useState(false);
  const trail = usePopoverTrail();
  const floating = usePopoverFloating();

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const isRenderProp = typeof children === 'function';
  const formattedEntries = React.useMemo(() => {
    if (!isRenderProp) return null;
    const result: Array<TrailEntry & { isPinned: boolean }> = [];
    for (const entry of floating) {
      if (entry) {
        result.push({ ...entry, isPinned: true });
      }
    }
    for (const entry of trail) {
      if (entry) {
        result.push({ ...entry, isPinned: false });
      }
    }
    return result;
  }, [isRenderProp, floating, trail]);

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
