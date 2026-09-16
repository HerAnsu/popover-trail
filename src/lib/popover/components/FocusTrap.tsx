/**
 * Accessible Focus Trap Container Component.
 * Clean Architecture Layer 4: Presentation & UI Components.
 *
 * Traps keyboard focus within its child elements, cycling focus between the first
 * and last tabbable elements while the popover card is modal.
 *
 * @example
 * ```tsx
 * <FocusTrap autoFocus returnFocus>
 *   <div>
 *     <input placeholder="Search..." />
 *     <button type="button">Submit</button>
 *   </div>
 * </FocusTrap>
 * ```
 *
 * @module components/FocusTrap
 */

import { useRef, type ReactNode, type CSSProperties } from 'react';
import { useFocusTrap } from '../hooks/useFocusTrap';

export interface FocusTrapProps {
  /** Focus trap children containing focusable elements. */
  readonly children: ReactNode;
  /** Whether the focus trap is temporarily disabled. Defaults to false. */
  readonly disabled?: boolean;
  /** Whether to return focus to the previously active element on unmount. Defaults to true. */
  readonly returnFocus?: boolean;
  /** Whether to automatically move focus to the first focusable child on mount. Defaults to true. */
  readonly autoFocus?: boolean;
  /** Optional inline styles for the trap container. */
  readonly style?: CSSProperties;
  /** Optional CSS class name for the trap container. */
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
