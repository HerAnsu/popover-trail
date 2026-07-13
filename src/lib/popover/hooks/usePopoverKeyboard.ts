import { useEffect } from "react";
import { usePopoverActions, usePopoverStore } from "../context";

/**
 * Hook to automatically bind global keyboard events (like Escape to close the topmost popover).
 * Optimizes event attachment by only binding to window when there is at least one active popover.
 */
export function usePopoverKeyboard() {
  const { closeTopmost } = usePopoverActions();
  const hasActive = usePopoverStore((state) => state.trail.length > 0 || state.floating.length > 0);

  useEffect(() => {
    if (!hasActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closeTopmost();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTopmost, hasActive]);
}
