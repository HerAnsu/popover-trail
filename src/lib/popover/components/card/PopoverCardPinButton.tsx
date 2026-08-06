import React, { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';

/**
 * Sub-component for the Pin/Unpin action button of a `<PopoverCard>`.
 */
export type PopoverCardPinButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardPinButton<E extends ElementType = 'button'>({
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
