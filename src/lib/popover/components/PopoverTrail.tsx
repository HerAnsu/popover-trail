/**
 * Declarative PopoverTrail Container Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Automatically renders all active floating (pinned) and cascading trail popovers
 * into a portal target, executing the provided `renderCard` callback for each entry.
 *
 * @example
 * ```tsx
 * <PopoverTrail
 *   renderCard={(entry, index, isPinned) => (
 *     <PopoverCard key={entry.key} entry={entry} index={index} isPinned={isPinned}>
 *       <PopoverCard.Header title={entry.key}>
 *         <PopoverCard.PinButton />
 *         <PopoverCard.CloseButton />
 *       </PopoverCard.Header>
 *       <PopoverCard.Content>
 *         <p>Card content</p>
 *       </PopoverCard.Content>
 *     </PopoverCard>
 *   )}
 * />
 * ```
 *
 * @module components/PopoverTrail
 */

import { type ReactNode } from 'react';
import { PopoverPortal } from './PopoverPortal';
import { usePopoverTrail, usePopoverFloating } from '../hooks/usePopoverSelectors';
import type { TrailEntry } from '../types';

export interface PopoverTrailProps<TData = unknown> {
  /** Render callback invoked for each active popover card entry. */
  renderCard: (entry: TrailEntry<TData>, index: number, isPinned: boolean) => ReactNode;
  /** Optional filter predicate to selectively include or exclude certain entries. */
  filter?: (entry: TrailEntry<TData>, index: number) => boolean;
  /** Custom portal container DOM node or ref. Defaults to document.body. */
  container?: HTMLElement | (() => HTMLElement | null) | React.RefObject<HTMLElement | null>;
}

export function PopoverTrail<TData = unknown>({
  renderCard,
  filter,
  container,
}: PopoverTrailProps<TData>) {
  const trail = usePopoverTrail<TData>();
  const floating = usePopoverFloating<TData>();

  let virtualIndex = 0;

  return (
    <PopoverPortal container={container}>
      {floating.map((entry) => {
        const idx = virtualIndex++;
        if (filter && !filter(entry, idx)) return null;
        return renderCard(entry, idx, true);
      })}
      {trail.map((entry) => {
        const idx = virtualIndex++;
        if (filter && !filter(entry, idx)) return null;
        return renderCard(entry, idx, false);
      })}
    </PopoverPortal>
  );
}
