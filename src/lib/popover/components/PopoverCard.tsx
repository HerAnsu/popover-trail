import React, {
  createContext,
  useContext,
  useMemo,
  useCallback,
  type ReactNode,
  type ComponentPropsWithoutRef,
  type ElementType,
} from 'react';
import { clsx } from '../utils/storeHelpers';
import { usePopoverCard, type UsePopoverCardResult } from '../hooks/usePopoverCard';
import { usePopoverActions } from '../context';
import type { TrailEntry, PopoverPlacement } from '../types';
import { validateCardSubComponentScope } from '../utils/devWarnings';

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
PopoverCardScopeContext.displayName = 'PopoverCardScopeContext';

function usePopoverCardScope() {
  const ctx = useContext(PopoverCardScopeContext);
  validateCardSubComponentScope(Boolean(ctx), 'SubComponent');
  if (!ctx) {
    throw new Error('<PopoverCard> sub-components must be rendered within a <PopoverCard>');
  }
  return ctx;
}

/** Helper type inferring the ref prop type of a polymorphic component element. */
export type PolymorphicRef<E extends ElementType> = React.ComponentPropsWithRef<E>['ref'];

/** Polymorphic component props helper including strict element ref type inference. */
export type PolymorphicPropsWithRef<E extends ElementType, P = object> = P &
  Omit<ComponentPropsWithoutRef<E>, keyof P | 'as'> & {
    as?: E;
    ref?: PolymorphicRef<E>;
  };

/** Polymorphic component props helper without ref. */
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

const PopoverCardBase = React.forwardRef(function PopoverCard(
  props: Record<string, unknown>,
  outerRef: React.ForwardedRef<unknown>,
) {
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
  } = props as unknown as PopoverCardProps<ElementType, unknown>;

  const Component = as || 'div';
  const actions = usePopoverActions();
  const card = usePopoverCard({ entry, index, isPinned, placement });

  const handleRef = React.useCallback(
    (node: HTMLElement | null) => {
      card.ref(node as HTMLDivElement | null);
      if (typeof outerRef === 'function') {
        outerRef(node);
      } else if (outerRef && typeof outerRef === 'object') {
        (outerRef as React.MutableRefObject<HTMLElement | null>).current = node;
      }
    },
    [card, outerRef],
  );

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

  const mergedClassName = clsx(className as string, card.transitionClassName);

  return (
    <PopoverCardScopeContext.Provider value={scope}>
      <Component
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
        aria-label={(restProps['aria-label'] as string) ?? `Popover ${entry.key}`}
        aria-describedby={entry.ariaDescribedby}
        {...restProps}>
        {typeof children === 'function' ? children(scope as PopoverCardScope<unknown>) : children}
      </Component>
    </PopoverCardScopeContext.Provider>
  );
});

/**
 * Sub-component for the drag handle area of a `<PopoverCard>`.
 */
export type PopoverCardHandleProps<E extends ElementType = 'header'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

function PopoverCardHandle<E extends ElementType = 'header'>({
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
}

/**
 * Sub-component for the Pin/Unpin action button of a `<PopoverCard>`.
 */
export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

function PopoverCardPinButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  disabled,
  ...restProps
}: PopoverCardPinButtonProps<E>) {
  const Component = as || 'button';
  const { entry, isPinned, actions } = usePopoverCardScope();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      actions.togglePin(entry.key);
      onClick?.(e);
    },
    [disabled, actions, entry.key, onClick],
  );

  const isNativeButton = Component === 'button';

  return (
    <Component
      {...(isNativeButton ? { type: 'button' as const } : {})}
      disabled={disabled}
      onClick={handleClick}
      aria-pressed={isPinned}
      aria-label={isPinned ? 'Unpin popover' : 'Pin popover'}
      data-pinned={isPinned}
      {...restProps}>
      {children ?? (isPinned ? 'Unpin' : 'Pin')}
    </Component>
  );
}

/**
 * Sub-component for the Close action button of a `<PopoverCard>`.
 */
export type PopoverCardCloseButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

function PopoverCardCloseButton<E extends ElementType = 'button'>({
  as,
  children,
  onClick,
  disabled,
  ...restProps
}: PopoverCardCloseButtonProps<E>) {
  const Component = as || 'button';
  const { entry, actions } = usePopoverCardScope();

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) {
        e.preventDefault();
        return;
      }
      actions.closeByKey(entry.key);
      onClick?.(e);
    },
    [disabled, actions, entry.key, onClick],
  );

  const isNativeButton = Component === 'button';

  return (
    <Component
      {...(isNativeButton ? { type: 'button' as const } : {})}
      disabled={disabled}
      onClick={handleClick}
      aria-label="Close popover"
      {...restProps}>
      {children ?? '✕'}
    </Component>
  );
}

/**
 * Sub-component for the main content body container of a `<PopoverCard>`.
 */
export type PopoverCardContentProps<E extends ElementType = 'div'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

function PopoverCardContent<E extends ElementType = 'div'>({
  as,
  children,
  ...restProps
}: PopoverCardContentProps<E>) {
  const Component = as || 'div';
  return <Component {...restProps}>{children}</Component>;
}

export const PopoverCard: PopoverCardComponent = Object.assign(
  PopoverCardBase as unknown as PopoverCardComponent,
  {
    Handle: PopoverCardHandle,
    PinButton: PopoverCardPinButton,
    CloseButton: PopoverCardCloseButton,
    Content: PopoverCardContent,
  },
);
