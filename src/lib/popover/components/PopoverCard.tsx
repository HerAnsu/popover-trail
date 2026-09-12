/**
 * Polymorphic Compound PopoverCard Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
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
