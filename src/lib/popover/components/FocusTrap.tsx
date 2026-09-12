/**
 * Accessible Focus Trap Compound Container Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * @module components/FocusTrap
 */

import { useRef, type ReactNode, type CSSProperties } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface FocusTrapProps {
  readonly children: ReactNode;
  readonly disabled?: boolean;
  readonly returnFocus?: boolean;
  readonly autoFocus?: boolean;
  readonly style?: CSSProperties;
  readonly className?: string;
}

export function FocusTrap({
  children,
  disabled = false,
  returnFocus = true,
  autoFocus = true,
  style,
  className,
}: FocusTrapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  useFocusTrap(containerRef, { enabled: !disabled, returnFocus, autoFocus });

  return (
    <div ref={containerRef} style={style} className={className}>
      {children}
    </div>
  );
}
