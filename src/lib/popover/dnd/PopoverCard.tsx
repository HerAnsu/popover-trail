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

  const {
    actions,
    isTop,
    isDragging,
    transitionClassName,
    style: cardStyle,
    isDragAllowed,
    dragHandleProps,
    ref: cardRef,
    onMouseEnter,
    onMouseLeave,
    onKeyDown,
  } = card;
  const { bringToFront } = actions;
  const { key, exitTransitionDuration, ariaDescribedby } = entry;

  const handleMouseDown = useCallback(
    () => bringToFront(key),
    [bringToFront, key],
  );

  const combinedClassName = useMemo(
    () =>
      clsx(
        className,
        { topmost: isTop, pinned: isPinned, dragging: isDragging },
        transitionClassName,
      ),
    [className, isTop, isPinned, isDragging, transitionClassName],
  );

  const combinedStyle = useMemo(
    () => ({
      ...cardStyle,
      ...(exitTransitionDuration !== undefined
        ? { transitionDuration: `${exitTransitionDuration}ms` }
        : {}),
      ...customStyle,
    }),
    [cardStyle, exitTransitionDuration, customStyle],
  );

  const dragProps = isDragAllowed ? dragHandleProps : {};

  return (
    <dialog
      open
      tabIndex={-1}
      id={`popover-card-${key}`}
      ref={cardRef}
      style={combinedStyle}
      aria-label={
        props['aria-label'] ?? (props['aria-labelledby'] ? undefined : `Popover ${key}`)
      }
      aria-labelledby={props['aria-labelledby']}
      aria-describedby={ariaDescribedby ? `desc-${key}` : undefined}
      className={combinedClassName}>
      <FocusTrap
        disabled={!focusLockEnabled || !isTop || isPinned}
        returnFocus={RETURN_FOCUS_CONFIG.returnFocus}>
        <div
          role="presentation"
          style={FULL_FLEX_CONTAINER_STYLE}
          onMouseDown={handleMouseDown}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onKeyDown={onKeyDown}>
          <PopoverCardContext value={key}>
            {ariaDescribedby && (
              <div id={`desc-${key}`} style={DISPLAY_NONE_STYLE}>
                {ariaDescribedby}
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
