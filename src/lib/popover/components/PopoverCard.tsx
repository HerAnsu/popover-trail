import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ElementType,
} from 'react';
import { usePopoverCard, type UsePopoverCardResult } from '../hooks/usePopoverCard';
import { usePopoverActions } from '../context';
import type { TrailEntry, PopoverPlacement } from '../types';

/**
 * Shared Context scope holding active card state and action handlers for sub-components.
 */
interface PopoverCardScope<TData = unknown> {
  entry: TrailEntry<TData>;
  index: number;
  isPinned: boolean;
  card: UsePopoverCardResult;
  actions: ReturnType<typeof usePopoverActions>;
}

const PopoverCardScopeContext = createContext<PopoverCardScope | null>(null);

function usePopoverCardScope() {
  const ctx = useContext(PopoverCardScopeContext);
  if (!ctx) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
  return ctx;
}

/**
 * Polymorphic component props helper.
 */
export type PolymorphicProps<E extends ElementType, P = object> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    as?: E;
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

export type PopoverCardProps<E extends ElementType = 'div', TData = unknown> = PolymorphicProps<
  E,
  PopoverCardBaseProps<TData>
>;

/**
 * Root `<PopoverCard>` Headless Unstyled Component.
 * Binds positioning, accessibility attributes, data-attributes, and CSS variables automatically.
 */
export function PopoverCard<E extends ElementType = 'div', TData = unknown>({
  as,
  entry,
  index,
  isPinned,
  placement = 'bottom',
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardProps<E, TData>) {
  const Component = as || 'div';
  const actions = usePopoverActions();
  const card = usePopoverCard({ entry, index, isPinned, placement });

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
    () => ({
      ...card.style,
      ...userStyle,
    }),
    [card.style, userStyle],
  );

  return (
    <PopoverCardScopeContext.Provider value={scope}>
      <Component
        ref={card.ref}
        style={combinedStyle}
        className={className}
        onMouseEnter={card.onMouseEnter}
        onMouseLeave={card.onMouseLeave}
        onKeyDown={card.onKeyDown}
        data-state={entry.transitionStatus || 'mounted'}
        data-pinned={isPinned ? 'true' : 'false'}
        data-key={entry.key}
        role="dialog"
        aria-describedby={entry.ariaDescribedby}
        {...restProps}>
        {typeof children === 'function' ? children(scope as PopoverCardScope<TData>) : children}
      </Component>
    </PopoverCardScopeContext.Provider>
  );
}

/**
 * Sub-component for the drag handle area of a `<PopoverCard>`.
 */
export type PopoverCardHandleProps<E extends ElementType = 'header'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverCard.Handle = function PopoverCardHandle<E extends ElementType = 'header'>({
  as,
  children,
  className,
  style: userStyle,
  ...restProps
}: PopoverCardHandleProps<E>) {
  const Component = as || 'header';
  const { card } = usePopoverCardScope();

  const combinedStyle = useMemo(
    () => ({
      ...(card.dragHandleProps.style as React.CSSProperties),
      ...userStyle,
    }),
    [card.dragHandleProps.style, userStyle],
  );

  return (
    <Component {...card.dragHandleProps} style={combinedStyle} className={className} {...restProps}>
      {children}
    </Component>
  );
};

/**
 * Sub-component for the Pin/Unpin action button of a `<PopoverCard>`.
 */
export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverCard.PinButton = function PopoverCardPinButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  ...restProps
}: PopoverCardPinButtonProps<E>) {
  const Component = as || 'button';
  const { entry, isPinned, actions } = usePopoverCardScope();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    actions.togglePin(entry.key);
    onClick?.(e);
  };

  return (
    <Component type="button" onClick={handleClick} data-pinned={isPinned} {...restProps}>
      {children ?? (isPinned ? 'Unpin' : 'Pin')}
    </Component>
  );
};

/**
 * Sub-component for the Close action button of a `<PopoverCard>`.
 */
export type PopoverCardCloseButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverCard.CloseButton = function PopoverCardCloseButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  ...restProps
}: PopoverCardCloseButtonProps<E>) {
  const Component = as || 'button';
  const { entry, actions } = usePopoverCardScope();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    actions.closeByKey(entry.key);
    onClick?.(e);
  };

  return (
    <Component type="button" onClick={handleClick} {...restProps}>
      {children ?? '✕'}
    </Component>
  );
};

/**
 * Sub-component for the main content body container of a `<PopoverCard>`.
 */
export type PopoverCardContentProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

PopoverCard.Content = function PopoverCardContent<E extends ElementType = 'div'>({
  as,
  children,
  ...restProps
}: PopoverCardContentProps<E>) {
  const Component = as || 'div';
  return <Component {...restProps}>{children}</Component>;
};
