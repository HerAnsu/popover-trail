/**
 * High-level Draggable PopoverCard Compound Component with FocusLock.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module dnd/PopoverCard
 */

import { memo, useCallback, useMemo } from 'react';
import { FocusTrap } from '../components/FocusTrap';
import { PopoverCardContext } from '../context/PopoverCardContext';
import { clsx } from '../utils/clsx';
import type { PopoverCardProps } from './dndTypes';
import {
  FULL_FLEX_CONTAINER_STYLE,
  DISPLAY_NONE_STYLE,
  RETURN_FOCUS_CONFIG,
  resolveCardFeatures,
} from './dndCardConfig';
import { usePopoverDraggableCard } from './usePopoverDraggableCard';

function PopoverCardInner<TData = unknown>(props: Readonly<PopoverCardProps<TData>>) {
  const {
    entry,
    index,
    isPinned,
    placement = 'bottom',
    children,
    className = 'popover-card',
    style: customStyle,
    dragHandle,
  } = props;
  const { dragEnabled, tiltEnabled, focusLockEnabled } = resolveCardFeatures(props);

  const card = usePopoverDraggableCard({
    entry,
    index,
    isPinned,
    placement,
    enableDrag: dragEnabled,
    enableTilt: tiltEnabled,
  });

  const handleMouseDown = useCallback(
    () => card.actions.bringToFront(entry.key),
    [card.actions, entry.key],
  );

  const combinedClassName = useMemo(
    () =>
      clsx(
        className,
        { topmost: card.isTop, pinned: isPinned, dragging: card.isDragging },
        card.transitionClassName,
      ),
    [className, card.isTop, isPinned, card.isDragging, card.transitionClassName],
  );

  const combinedStyle = useMemo(
    () => ({
      ...card.style,
      ...(entry.exitTransitionDuration !== undefined
        ? { transitionDuration: `${entry.exitTransitionDuration}ms` }
        : {}),
      ...customStyle,
    }),
    [card.style, entry.exitTransitionDuration, customStyle],
  );

  const dragProps = card.isDragAllowed ? card.dragHandleProps : {};

  return (
    <dialog
      open
      tabIndex={-1}
      id={`popover-card-${entry.key}`}
      ref={card.ref}
      style={combinedStyle}
      aria-label={
        props['aria-label'] ?? (props['aria-labelledby'] ? undefined : `Popover ${entry.key}`)
      }
      aria-labelledby={props['aria-labelledby']}
      aria-describedby={entry.ariaDescribedby ? `desc-${entry.key}` : undefined}
      className={combinedClassName}>
      <FocusTrap
        disabled={!focusLockEnabled || !card.isTop || isPinned}
        returnFocus={RETURN_FOCUS_CONFIG.returnFocus}>
        <div
          role="presentation"
          style={FULL_FLEX_CONTAINER_STYLE}
          onMouseDown={handleMouseDown}
          onMouseEnter={card.onMouseEnter}
          onMouseLeave={card.onMouseLeave}
          onKeyDown={card.onKeyDown}>
          <PopoverCardContext value={entry.key}>
            {entry.ariaDescribedby && (
              <div id={`desc-${entry.key}`} style={DISPLAY_NONE_STYLE}>
                {entry.ariaDescribedby}
              </div>
            )}
            {dragHandle ? (
              <>
                {dragHandle(dragProps)}
                {children}
              </>
            ) : (
              <div {...dragProps} style={FULL_FLEX_CONTAINER_STYLE}>
                {children}
              </div>
            )}
          </PopoverCardContext>
        </div>
      </FocusTrap>
    </dialog>
  );
}

export const PopoverCard = memo(PopoverCardInner);
PopoverCard.displayName = 'PopoverCard';
