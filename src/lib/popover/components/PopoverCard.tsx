import React, { useMemo, type ReactNode, type ElementType } from 'react';
import { clsx } from '../utils/clsx';
import { usePopoverCard } from '../hooks/usePopoverCard';
import { usePopoverActions } from '../context/usePopoverStore';
import { useMergedRef } from '../hooks/useHookUtils';
import {
  type PolymorphicRef,
  type PolymorphicPropsWithRef,
  type PolymorphicProps,
  type TrailEntry,
  type PopoverPlacement,
} from '../types';
import { PopoverCardScopeContext, type PopoverCardScope } from './card/PopoverCardScopeContext';
import { PopoverCardHandle, type PopoverCardHandleProps } from './card/PopoverCardHandle';
import { PopoverCardPinButton, type PopoverCardPinButtonProps } from './card/PopoverCardPinButton';
import {
  PopoverCardCloseButton,
  type PopoverCardCloseButtonProps,
} from './card/PopoverCardCloseButton';
import { PopoverCardContent, type PopoverCardContentProps } from './card/PopoverCardContent';

export type {
  PolymorphicRef,
  PolymorphicPropsWithRef,
  PolymorphicProps,
  PopoverCardHandleProps,
  PopoverCardPinButtonProps,
  PopoverCardCloseButtonProps,
  PopoverCardContentProps,
};

/**
 * Props for the root `<PopoverCard>` Headless component.
 */
export interface PopoverCardBaseProps<TData = unknown> {
  /** The specific trail entry represented by the card. */
  entry: TrailEntry<TData>;
  /** The virtual rendering index of the card. */
  index: number;
  /** True if this card is currently pinned/floating. */
  isPinned: boolean;
  /** Layout placement direction preference relative to the trigger. */
  placement?: PopoverPlacement;
  /** Children elements or render prop function. */
  children?: ReactNode | ((scope: PopoverCardScope<TData>) => ReactNode);
}

export type PopoverCardProps<
  E extends ElementType = 'div',
  TData = unknown,
> = PolymorphicPropsWithRef<E, PopoverCardBaseProps<TData>>;

/**
 * Root `<PopoverCard>` Headless Unstyled Component.
 * Binds positioning, accessibility attributes, data-attributes, and CSS variables automatically.
 *
 * @example
 * ```tsx
 * import { PopoverCard } from 'popover-trail';
 *
 * function MyCard({ entry, index, isPinned }) {
 *   return (
 *     <PopoverCard entry={entry} index={index} isPinned={isPinned} className="card-popup">
 *       <PopoverCard.Handle>Drag Me</PopoverCard.Handle>
 *       <PopoverCard.Content>{entry.data?.title}</PopoverCard.Content>
 *       <PopoverCard.CloseButton>Close</PopoverCard.CloseButton>
 *     </PopoverCard>
 *   );
 * }
 * ```
 */
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

    const handleRef = useMergedRef(card.ref, outerRef);

    const scope = useMemo<PopoverCardScope>(
      () => ({
        entry: entry as TrailEntry<unknown>,
        index,
        isPinned,
        card,
        actions,
      }),
      [entry, index, isPinned, card, actions],
    );

    const combinedStyle = useMemo(
      () => (userStyle ? { ...card.style, ...userStyle } : card.style),
      [card.style, userStyle],
    );

    const mergedClassName = clsx(className, card.transitionClassName);
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

export const PopoverCard: PopoverCardComponent = Object.assign(
  PopoverCardBase as unknown as PopoverCardComponent,
  {
    Handle: PopoverCardHandle,
    PinButton: PopoverCardPinButton,
    CloseButton: PopoverCardCloseButton,
    Content: PopoverCardContent,
  },
);
