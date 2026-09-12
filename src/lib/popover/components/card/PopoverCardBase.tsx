/**
 * Base Popover Card Implementation with Scope Context.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/PopoverCardBase
 */

import React, { useMemo, useRef, type ElementType } from 'react';
import { clsx } from '../../utils/clsx';
import { usePopoverCard } from '../../hooks/usePopoverCard';
import { usePopoverActions } from '../../context/usePopoverStore';
import { useMergedRef } from '../../hooks/useHookUtils';
import { PopoverCardScopeContext, type PopoverCardScope } from './PopoverCardScopeContext';
import type { PopoverCardProps } from './types';

function resolveCardAriaLabel(userLabel: unknown, entryKey: string): string {
  return typeof userLabel === 'string' && userLabel.length > 0 ? userLabel : `Popover ${entryKey}`;
}

export const PopoverCardBase = React.forwardRef<unknown, PopoverCardProps<ElementType, unknown>>(
  (props, outerRef) => {
    const {
      as,
      entry,
      index,
      isPinned,
      placement = 'bottom',
      children,
      className,
      style: userStyle,
      ...restProps
    } = props;

    const Component = as || 'div';
    const actions = usePopoverActions();
    const card = usePopoverCard({ entry, index, isPinned, placement });

    const domRef = useRef<HTMLElement | null>(null);
    const handleRef = useMergedRef(card.ref, domRef, outerRef);

    const scope = useMemo<PopoverCardScope>(
      () => ({ entry, index, isPinned, card, actions, cardRef: domRef }),
      [entry, index, isPinned, card, actions],
    );

    const combinedStyle = useMemo(
      () => (userStyle ? { ...card.style, ...userStyle } : card.style),
      [card.style, userStyle],
    );

    const mergedClassName = clsx('popover-card', className, card.transitionClassName);
    const userAriaLabel = restProps['aria-label'];
    const ariaLabel = useMemo(
      () => resolveCardAriaLabel(userAriaLabel, entry.key),
      [userAriaLabel, entry.key],
    );

    return (
      <PopoverCardScopeContext value={scope}>
        <Component
          id={restProps.id ?? `popover-card-${entry.key}`}
          ref={handleRef}
          style={combinedStyle}
          className={mergedClassName || undefined}
          onMouseEnter={card.onMouseEnter}
          onMouseLeave={card.onMouseLeave}
          onKeyDown={card.onKeyDown}
          data-state={entry.transitionStatus || 'mounted'}
          data-pinned={isPinned ? 'true' : 'false'}
          data-key={entry.key}
          role="dialog"
          aria-modal={!isPinned}
          aria-label={ariaLabel}
          aria-describedby={entry.ariaDescribedby}
          {...restProps}>
          {typeof children === 'function' ? children(scope) : children}
        </Component>
      </PopoverCardScopeContext>
    );
  },
);

PopoverCardBase.displayName = 'PopoverCard';
