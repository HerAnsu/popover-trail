import React, { useMemo, useRef, type ReactNode, type ElementType } from 'react';
import { clsx } from '../utils/clsx';
import { usePopoverCard } from '../hooks/usePopoverCard';
import { usePopoverActions } from '../context/usePopoverStore';
import { useMergedRef } from '../hooks/useHookUtils';
import { type PolymorphicPropsWithRef, type TrailEntry, type PopoverPlacement } from '../types';
import { PopoverCardScopeContext, type PopoverCardScope } from './card/PopoverCardScopeContext';
import { PopoverCardHandle } from './card/PopoverCardHandle';
import { PopoverCardPinButton } from './card/PopoverCardPinButton';
import { PopoverCardCloseButton } from './card/PopoverCardCloseButton';
import { PopoverCardContent } from './card/PopoverCardContent';

export type { PolymorphicPropsWithRef };

/**
 * Props for the root `<PopoverCard>` Headless component.
 *
 * @template TData - Resolved data payload type stored within the trail entry.
 */
export interface PopoverCardBaseProps<TData = unknown> {
  /** The specific trail entry represented by this card. */
  entry: TrailEntry<TData>;
  /** The 0-based virtual rendering index of the card within the trail. */
  index: number;
  /** Whether the card is detached into a floating window (`true`) or stacked in the trail (`false`). */
  isPinned: boolean;
  /** Layout placement direction preference relative to the trigger. Defaults to 'bottom'. */
  placement?: PopoverPlacement;
  /** Card body content or a render prop function receiving the card scope. */
  children?: ReactNode | ((scope: PopoverCardScope<TData>) => ReactNode);
}

export type PopoverCardProps<
  E extends ElementType = 'div',
  TData = unknown,
> = PolymorphicPropsWithRef<E, PopoverCardBaseProps<TData>>;

export interface PopoverCardComponent {
  <E extends ElementType = 'div', TData = unknown>(
    props: PopoverCardProps<E, TData> & { ref?: React.Ref<unknown> },
  ): React.ReactNode;

  Handle: typeof PopoverCardHandle;
  PinButton: typeof PopoverCardPinButton;
  CloseButton: typeof PopoverCardCloseButton;
  Content: typeof PopoverCardContent;
}

function resolveCardAriaLabel(userLabel: unknown, entryKey: string): string {
  return typeof userLabel === 'string' ? userLabel : `Popover ${entryKey}`;
}

const PopoverCardBase = React.forwardRef<unknown, PopoverCardProps<ElementType, unknown>>(
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
      () => ({
        entry,
        index,
        isPinned,
        card,
        actions,
        cardRef: domRef,
      }),
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

export const PopoverCard: PopoverCardComponent = Object.assign(PopoverCardBase, {
  Handle: PopoverCardHandle,
  PinButton: PopoverCardPinButton,
  CloseButton: PopoverCardCloseButton,
  Content: PopoverCardContent,
});
export { type PolymorphicRef, type PolymorphicProps } from '../types';
export { type PopoverCardHandleProps } from './card/PopoverCardHandle';
export { type PopoverCardPinButtonProps } from './card/PopoverCardPinButton';
export { type PopoverCardContentProps } from './card/PopoverCardContent';
export { type PopoverCardCloseButtonProps } from './card/PopoverCardCloseButton';
