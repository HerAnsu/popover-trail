/**
 * Memory-safe custom React hook for binding DOM event listeners with automatic unmount cleanup.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/useEventListener
 */

import { useEffect } from 'react';
import { isBrowser } from '../utils/typeGuards';
import { useLatestRef } from './useHookUtils';

/**
 * Attaches a strongly typed event listener to the `window` object.
 *
 * @example
 * ```tsx
 * useEventListener('resize', () => {
 *   console.log('Window resized:', window.innerWidth);
 * });
 * ```
 */
export function useEventListener<K extends keyof WindowEventMap>(
  eventName: K,
  handler: (event: WindowEventMap[K]) => void,
  element?: Window | null,
  options?: boolean | AddEventListenerOptions,
): void;

/**
 * Attaches a strongly typed event listener to the `document` object.
 *
 * @example
 * ```tsx
 * useEventListener('keydown', (e) => {
 *   if (e.key === 'Escape') handleDismiss();
 * }, document);
 * ```
 */
export function useEventListener<K extends keyof DocumentEventMap>(
  eventName: K,
  handler: (event: DocumentEventMap[K]) => void,
  element: Document | null,
  options?: boolean | AddEventListenerOptions,
): void;

/**
 * Attaches a strongly typed event listener to any HTMLElement.
 *
 * @example
 * ```tsx
 * useEventListener('scroll', handleScroll, containerElement, { passive: true });
 * ```
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

/**
 * Attaches a memory-safe DOM event listener with automatic unmount cleanup and latest-ref callback stability.
 *
 * Prevents re-attaching listeners when handler identity changes on re-render.
 *
 * @param eventName - Name of the DOM event to listen for.
 * @param handler - Callback function invoked on event trigger.
 * @param element - Target DOM node or window/document (defaults to `window`).
 * @param options - Standard AddEventListenerOptions or boolean for capture.
 */
export function useEventListener<E extends Event = Event>(
  eventName: string,
  handler: (event: E) => void,
  element: EventTarget | null = isBrowser() ? window : null,
  options?: boolean | AddEventListenerOptions,
): void {
  const savedHandler = useLatestRef(handler);

  const isBoolean = typeof options === 'boolean';
  const { capture, passive, once } = isBoolean
    ? { capture: options, passive: undefined, once: undefined }
    : (options ?? {});

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
  }, [eventName, element, isBoolean, capture, passive, once, savedHandler]);
}
