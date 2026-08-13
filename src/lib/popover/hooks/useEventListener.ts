import { useEffect, useInsertionEffect, useRef } from 'react';

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

  useInsertionEffect(() => {
    savedHandler.current = handler;
    optionsRef.current = options;
  });

  useEffect(() => {
    const target = element ?? (typeof window !== 'undefined' ? window : null);
    if (!target) return;

    const listener = (event: Event) => {
      savedHandler.current(event as WindowEventMap[K]);
    };

    target.addEventListener(eventName, listener, optionsRef.current);
    return () => {
      target.removeEventListener(eventName, listener, optionsRef.current);
    };
  }, [eventName, element]);
}
