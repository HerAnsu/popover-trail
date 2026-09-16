/**
 * Polymorphic Compound PopoverCard Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Serves as the visual card container for a popover item in the trail or floating stack.
 *
 * Compound subcomponents:
 * - `PopoverCard.Header`: Optional header bar with integrated title and actions.
 * - `PopoverCard.Handle`: Drag handle for repositioning floating cards.
 * - `PopoverCard.PinButton`: Toggles between cascading trail and floating pinned state.
 * - `PopoverCard.CloseButton`: Dismisses the popover card and its child branch.
 * - `PopoverCard.Content`: Main body container for popover contents.
 *
 * @example
 * ```tsx
 * <PopoverCard entry={entry} index={index} isPinned={isPinned}>
 *   <PopoverCard.Header title="Card Details">
 *     <PopoverCard.PinButton />
 *     <PopoverCard.CloseButton />
 *   </PopoverCard.Header>
 *   <PopoverCard.Content>
 *     <p>Card body content</p>
 *   </PopoverCard.Content>
 * </PopoverCard>
 * ```
 *
 * @module components/PopoverCard
 */

import type React from 'react';
import type { ElementType } from 'react';
import { PopoverCardBase } from './card/PopoverCardBase';
import { PopoverCardHandle } from './card/PopoverCardHandle';
import { PopoverCardPinButton } from './card/PopoverCardPinButton';
import { PopoverCardCloseButton } from './card/PopoverCardCloseButton';
import { PopoverCardContent } from './card/PopoverCardContent';
import { PopoverCardHeader } from './card/PopoverCardHeader';
import type { PopoverCardProps } from './card/types';

export type { PopoverCardProps, PopoverCardBaseProps } from './card/types';
export type { PolymorphicPropsWithRef, PolymorphicRef, PolymorphicProps } from '../types';
export type { PopoverCardHandleProps } from './card/PopoverCardHandle';
export type { PopoverCardPinButtonProps } from './card/PopoverCardPinButton';
export type { PopoverCardContentProps } from './card/PopoverCardContent';
export type { PopoverCardCloseButtonProps } from './card/PopoverCardCloseButton';
export type { PopoverCardHeaderProps } from './card/PopoverCardHeader';

export interface PopoverCardComponent {
  <E extends ElementType = 'div', TData = unknown>(
    props: PopoverCardProps<E, TData> & { ref?: React.Ref<unknown> },
  ): React.ReactNode;

  Handle: typeof PopoverCardHandle;
  PinButton: typeof PopoverCardPinButton;
  CloseButton: typeof PopoverCardCloseButton;
  Content: typeof PopoverCardContent;
  Header: typeof PopoverCardHeader;
}

export const PopoverCard: PopoverCardComponent = Object.assign(PopoverCardBase, {
  Handle: PopoverCardHandle,
  PinButton: PopoverCardPinButton,
  CloseButton: PopoverCardCloseButton,
  Content: PopoverCardContent,
  Header: PopoverCardHeader,
});
