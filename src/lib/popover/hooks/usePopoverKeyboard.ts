// Unused imports removed

/**
 * Hook to automatically bind global keyboard events (like Escape to close the topmost popover).
 * @deprecated Keyboard Escape closing is now handled automatically by the PopoverProvider.
 * This hook is kept for backward compatibility and is a no-op.
 */
export function usePopoverKeyboard() {
  // Escape key closing is now handled natively inside PopoverProvider to avoid event duplication.
}
