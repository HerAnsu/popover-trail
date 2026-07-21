import { useEffect, useRef } from 'react';

/**
 * Memory-safe custom React hook for binding window or element event listeners with auto cleanup on unmount.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element: Window | HTMLElement | Document | null = typeof window !== 'undefined' ? window : null,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener: typeof handler = (event) => savedHandler.current(event);
    element.addEventListener(eventName, eventListener as EventListener, options);

    return () => {
      element.removeEventListener(eventName, eventListener as EventListener, options);
    };
  }, [eventName, element, options]);
}
