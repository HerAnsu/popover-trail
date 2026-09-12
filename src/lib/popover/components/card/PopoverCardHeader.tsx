/**
 * Compound Header Subcomponent for Popover Cards.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/card/PopoverCardHeader
 */

import { type ReactNode, type CSSProperties } from 'react';
import { clsx } from '../../utils/clsx';
import { PopoverCardHandle } from './PopoverCardHandle';
import { PopoverCardPinButton } from './PopoverCardPinButton';
import { PopoverCardCloseButton } from './PopoverCardCloseButton';

export interface PopoverCardHeaderProps {
  readonly title?: ReactNode;
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
  showPin = true,
  showClose = true,
  children,
  className,
  style,
}: PopoverCardHeaderProps) {
  return (
    <PopoverCardHandle
      className={clsx('pt-card-header', className)}
      style={{ ...DEFAULT_HEADER_STYLE, ...style }}>
      {title ? <span className="pt-card-title">{title}</span> : null}
      {children}
      <div className="pt-card-header-actions" style={{ display: 'flex', gap: '4px' }}>
        {showPin ? <PopoverCardPinButton /> : null}
        {showClose ? <PopoverCardCloseButton /> : null}
      </div>
    </PopoverCardHandle>
  );
}
