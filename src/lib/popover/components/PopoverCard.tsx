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

/**
 * Root `<PopoverCard>` Headless Unstyled Component.
 * Binds positioning, accessibility attributes, data-attributes, and CSS variables automatically.
 *
 * @remarks
 * Renders as a polymorphic container (`as="div"` by default, configurable to `as="article"`, `as="section"`, etc.).
 * Includes compound subcomponents:
 * - `PopoverCard.Handle`: Drag grip handle for pointer dragging.
 * - `PopoverCard.PinButton`: Pin toggle button that switches between cascading trail and floating window.
 * - `PopoverCard.CloseButton`: Close trigger that dismisses the card and its child branch.
 * - `PopoverCard.Content`: Inner content wrapper.
 *
 * Automatically provides ARIA accessibility roles (`role="dialog"`, `aria-modal`, `aria-label`)
 * and data attributes (`data-state`, `data-pinned`, `data-key`).
 *
 * @example
 * ```tsx
 * import { PopoverCard } from 'popover-trail';
 *
 * function UserCard({ entry, index, isPinned }) {
 *   return (
 *     <PopoverCard entry={entry} index={index} isPinned={isPinned} className="card-container">
 *       <PopoverCard.Handle className="drag-bar">Drag card</PopoverCard.Handle>
 *       <PopoverCard.Content>
 *         <h3>{entry.data?.name}</h3>
 *         <p>{entry.data?.email}</p>
 *       </PopoverCard.Content>
 *       <PopoverCard.PinButton />
 *       <PopoverCard.CloseButton />
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

PopoverCardBase.displayName = 'PopoverCard';

export const PopoverCard: PopoverCardComponent = Object.assign(
  PopoverCardBase as unknown as PopoverCardComponent,
  {
    Handle: PopoverCardHandle,
    PinButton: PopoverCardPinButton,
    CloseButton: PopoverCardCloseButton,
    Content: PopoverCardContent,
  },
);
