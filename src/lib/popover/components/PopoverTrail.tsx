/**
 * Declarative PopoverTrail Container Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/PopoverTrail
 */

import { type ReactNode } from 'react';
import { PopoverPortal } from './PopoverPortal';
import { usePopoverTrail, usePopoverFloating } from '../hooks/usePopoverSelectors';
import type { TrailEntry } from '../types';

export interface PopoverTrailProps<TData = unknown> {
  renderCard: (entry: TrailEntry<TData>, index: number, isPinned: boolean) => ReactNode;
  filter?: (entry: TrailEntry<TData>, index: number) => boolean;
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
