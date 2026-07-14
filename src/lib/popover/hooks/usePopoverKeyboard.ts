/**
 * Hook to automatically bind global keyboard events (like Escape to close the topmost popover).
 *
 * @deprecated Keyboard Escape closing is now handled automatically by the {@link PopoverProvider}.
 * This hook is kept strictly for backward compatibility and is a no-op.
 *
 * @remarks
 * Escape key event listeners are consolidated directly inside the PopoverProvider
 * to prevent duplicate event listeners from closing multiple nested trail levels in a single tick.
 */
export function usePopoverKeyboard() {
  // Escape key closing is now handled natively inside PopoverProvider to avoid event duplication.
}
