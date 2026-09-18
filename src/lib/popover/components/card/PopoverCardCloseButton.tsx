/**
 * Accessible Close Button Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Automatically dismisses the enclosing popover and its child cascade subtree when clicked.
 *
 * @example
 * ```tsx
 * <PopoverCard.CloseButton>✕</PopoverCard.CloseButton>
 * ```
 *
 * @module components/card/PopoverCardCloseButton
 */

import { useCallback, type ReactNode, type ElementType } from 'react';
import type { PolymorphicProps } from '../PopoverCard';
import { usePopoverCardScope } from './PopoverCardScopeContext';
import { CardActionButtonBase, type CardActionButtonBaseProps } from './CardActionButtonBase';
import { resolveActionLabel } from '../../utils/a11y';

export type PopoverCardCloseButtonProps<E extends ElementType = 'button'> = PolymorphicProps<
  E,
  { children?: ReactNode }
>;

export function PopoverCardCloseButton<E extends ElementType = 'button'>(
  props: PopoverCardCloseButtonProps<E>,
) {
  const { entry, actions } = usePopoverCardScope();
  const handleClose = useCallback(() => actions.closeByKey(entry.key), [actions, entry.key]);

  return (
    <CardActionButtonBase<E>
      {...(props as CardActionButtonBaseProps<E>)}
      ariaLabel={resolveActionLabel('close')}
      onAction={handleClose}>
      {props.children ?? '✕'}
    </CardActionButtonBase>
  );
}
