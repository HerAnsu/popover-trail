/**
 * Compound Header Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Provides a draggable header bar containing title text, pin button, and close button.
 *
 * @example
 * ```tsx
 * <PopoverCard.Header title="Card Details" showPin showClose />
 * ```
 *
 * @module components/card/PopoverCardHeader
 */

import { type ReactNode, type CSSProperties } from 'react';
import { clsx } from '../../utils/clsx';
import { truncate } from '../../utils/stringUtils';
import { PopoverCardHandle } from './PopoverCardHandle';
import { PopoverCardPinButton } from './PopoverCardPinButton';
import { PopoverCardCloseButton } from './PopoverCardCloseButton';

export interface PopoverCardHeaderProps {
  readonly title?: ReactNode;
  readonly maxTitleLength?: number;
  readonly showPin?: boolean;
  readonly showClose?: boolean;
  readonly children?: ReactNode;
  readonly className?: string;
  readonly style?: CSSProperties;
}

const DEFAULT_HEADER_STYLE: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: '8px',
};

export function PopoverCardHeader({
  title,
  maxTitleLength,
  showPin = true,
  showClose = true,
  children,
  className,
  style,
}: PopoverCardHeaderProps) {
  const renderedTitle =
    typeof title === 'string' && maxTitleLength ? truncate(title, maxTitleLength) : title;

  return (
    <PopoverCardHandle
      className={clsx('pt-card-header', className)}
      style={{ ...DEFAULT_HEADER_STYLE, ...style }}>
      {renderedTitle ? <span className="pt-card-title">{renderedTitle}</span> : null}
      {children}
      <div className="pt-card-header-actions" style={{ display: 'flex', gap: '4px' }}>
        {showPin ? <PopoverCardPinButton /> : null}
        {showClose ? <PopoverCardCloseButton /> : null}
      </div>
    </PopoverCardHandle>
  );
}
