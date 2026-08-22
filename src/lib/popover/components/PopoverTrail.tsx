import React, { type ReactNode, useMemo } from 'react';
import { PopoverPortal } from './PopoverPortal';
import { usePopoverTrail, usePopoverFloating } from '../hooks/usePopoverSelectors';
import type { TrailEntry } from '../types';

/**
 * Props for the `<PopoverTrail>` wrapper component.
 *
 * @template TData - Resolved data payload type.
 */
export interface PopoverTrailProps<TData = unknown> {
  /**
   * Render function called for each active popover card in the trail or floating stack.
   *
   * @param entry - The popover trail entry data.
   * @param index - The 0-based virtual rendering index.
   * @param isPinned - True if the card is pinned as a floating window.
   * @returns ReactNode to render for this card.
   */
  renderCard: (entry: TrailEntry<TData>, index: number, isPinned: boolean) => ReactNode;

  /** Optional filter function to conditionally select which entries to render. */
  filter?: (entry: TrailEntry<TData>, index: number) => boolean;

  /** Optional custom DOM container element for the portal. Defaults to `document.body`. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

/**
 * High-level `<PopoverTrail>` Container Component.
 * Automatically tracks active trailing and floating cards, and renders them inside a Portal.
 *
 * @remarks
 * Eliminates repetitive state subscriptions and portal setup. Combines both cascading trail cards
 * and detached pinned windows into a single unified render callback loop.
 *
 * @example
 * ```tsx
 * import { PopoverTrail, PopoverCard } from 'popover-trail';
 *
 * export function TrailView() {
 *   return (
 *     <PopoverTrail
 *       renderCard={(entry, index, isPinned) => (
 *         <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
 *           <div>{entry.data?.title}</div>
 *         </PopoverCard>
 *       )}
 *     />
 *   );
 * }
 * ```
 *
 * @template TData - Resolved data payload type.
 * @param props - Card render function, optional filter, and container target.
 */
export function PopoverTrail<TData = unknown>({
  renderCard,
  filter,
  container,
}: PopoverTrailProps<TData>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  const filteredEntries = useMemo(() => {
    const list: Array<{ entry: TrailEntry<TData>; isPinned: boolean }> = [];
    let idx = 0;
    for (const entry of floating) {
      if (!filter || filter(entry, idx++)) {
        list.push({ entry, isPinned: true });
      }
    }
    for (const entry of trail) {
      if (!filter || filter(entry, idx++)) {
        list.push({ entry, isPinned: false });
      }
    }
    return list;
  }, [floating, trail, filter]);

  return (
    <PopoverPortal container={container}>
      {filteredEntries.map(({ entry, isPinned }, index) => renderCard(entry, index, isPinned))}
    </PopoverPortal>
  );
}
