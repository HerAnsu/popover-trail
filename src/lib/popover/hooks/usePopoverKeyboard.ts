import { useEffect } from 'react'
import { usePopoverActions } from '../context'

/**
 * Hook to automatically bind global keyboard events (like Escape to close the topmost popover).
 */
export function usePopoverKeyboard() {
  const { closeTopmost } = usePopoverActions()

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeTopmost()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [closeTopmost])
}
