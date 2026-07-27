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
  const optionsRef = useRef(options);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    if (!element || !element.addEventListener) return;

    const eventListener: typeof handler = (event) => savedHandler.current(event);
    const activeOptions = optionsRef.current;
    element.addEventListener(eventName, eventListener as EventListener, activeOptions);

    return () => {
      element.removeEventListener(eventName, eventListener as EventListener, activeOptions);
    };
  }, [eventName, element]);
}
