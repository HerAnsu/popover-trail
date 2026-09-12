/**
 * Memory-safe custom React hook for binding DOM event listeners with automatic unmount cleanup.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useEventListener
 */

import { useEffect, useInsertionEffect, useRef } from 'react';
import { isBrowser } from '../utils/typeGuards';

/**
 * Attaches a strongly typed event listener to the `window` object.
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions,
): void;

/**
 * Attaches a strongly typed event listener to the `document` object.
 */
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document | null,
  options?: boolean | AddEventListenerOptions,
): void;

/**
 * Attaches a strongly typed event listener to any HTMLElement.
 */
export function useEventListener<
  K extends keyof HTMLElementEventMap,
  TElement extends HTMLElement = HTMLElement,
>(
  eventName: K,
  handler: (event: HTMLElementEventMap[K]) => void,
  element: TElement | null,
  options?: boolean | AddEventListenerOptions,
): void;

/**
 * Attaches an event listener to any custom EventTarget.
 */
export function useEventListener<E extends Event = Event>(
  eventName: string,
  handler: (event: E) => void,
  element?: EventTarget | null,
  options?: boolean | AddEventListenerOptions,
): void;

export function useEventListener<E extends Event = Event>(
  eventName: string,
  handler: (event: E) => void,
  element: EventTarget | null = isBrowser() ? window : null,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useRef(handler);
  const optionsRef = useRef(options);

  useInsertionEffect(() => {
    savedHandler.current = handler;
    optionsRef.current = options;
  });

  const isBoolean = typeof options === 'boolean';
  const capture = isBoolean ? options : options?.capture;
  const passive = isBoolean ? undefined : options?.passive;
  const once = isBoolean ? undefined : options?.once;

  useEffect(() => {
    const target = element ?? (isBrowser() ? window : null);
    if (!target) return;

    const listener = (event: Event) => {
      savedHandler.current(event as E);
    };

    const currentOptions = isBoolean ? capture : { capture, passive, once };
    target.addEventListener(eventName, listener, currentOptions);
    return () => {
      target.removeEventListener(eventName, listener, currentOptions);
    };
  }, [eventName, element, isBoolean, capture, passive, once]);
}
