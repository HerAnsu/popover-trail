import { type ReactNode, useMemo } from 'react';
import { PopoverPortal, usePopoverTrail, usePopoverFloating } from '../context';
import type { TrailEntry } from '../types';

/**
 * Props for the `<PopoverTrail>` wrapper component.
 */
export interface PopoverTrailProps<TData = unknown> {
  /**
   * Render function called for each active popover card in the trail or floating stack.
   *
   * @param entry - The popover trail entry data.
   * @param index - The virtual rendering index.
   * @param isPinned - True if the card is pinned/floating.
   * @returns ReactNode to render.
   */
  renderCard: (entry: TrailEntry<TData>, index: number, isPinned: boolean) => ReactNode;

  /** Optional filter function to conditionally select which entries to render. */
  filter?: (entry: TrailEntry<TData>, index: number) => boolean;

  /** Optional custom DOM container element for the portal. Defaults to document.body. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

/**
 * High-level `<PopoverTrail>` Headless Component.
 * Encapsulates active popover entries tracking and portal mounting with a simple `renderCard` prop callback.
 */
export function PopoverTrail<TData = unknown>({
  renderCard,
  filter,
  container,
}: PopoverTrailProps<TData>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  const allEntries = useMemo(() => {
    const combined: Array<{ entry: TrailEntry<TData>; isPinned: boolean }> = [
      ...floating.map((entry) => ({ entry, isPinned: true })),
      ...trail.map((entry) => ({ entry, isPinned: false })),
    ];
    return combined;
  }, [floating, trail]);

  const filteredEntries = useMemo(() => {
    if (!filter) return allEntries;
    return allEntries.filter(({ entry }, idx) => filter(entry, idx));
  }, [allEntries, filter]);

  return (
    <PopoverPortal container={container}>
      {filteredEntries.map(({ entry, isPinned }, index) => renderCard(entry, index, isPinned))}
    </PopoverPortal>
  );
}
