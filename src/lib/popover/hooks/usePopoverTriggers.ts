import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { usePopoverActions } from '../context/usePopoverStore';
import { useIsPopoverOpen } from './usePopoverSelectors';
import type {
  AnchorEventLike,
  OpenNestedOptions,
  OpenRootOptions,
  PopoverDisplayOptions,
} from '../types';

function usePopoverTriggerBase<TOptions extends PopoverDisplayOptions>(
  key: string,
  options: TOptions | undefined,
  onOpenHandler: (e: React.MouseEvent<HTMLElement>, currentTarget: HTMLElement) => void,
  explicitIsOpen?: boolean,
) {
  const actions = usePopoverActions();
  const optionsRef = useRef(options);
  const onOpenHandlerRef = useRef(onOpenHandler);
  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    optionsRef.current = options;
    onOpenHandlerRef.current = onOpenHandler;
  }, [options, onOpenHandler]);

  useEffect(() => {
    return () => {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
    };
  }, []);

  const onClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (optionsRef.current?.hover?.enabled) return;
    onOpenHandlerRef.current(e, e.currentTarget);
  }, []);

  const onMouseEnter = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const hoverOpts = optionsRef.current?.hover;
    if (hoverOpts?.enabled) {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      const currentTarget = e.currentTarget;
      const delay = hoverOpts.openDelay ?? 200;
      e.persist?.();
      openTimerRef.current = setTimeout(() => {
        onOpenHandlerRef.current(e, currentTarget);
      }, delay);
    }
  }, []);

  const onMouseLeave = useCallback(() => {
    const hoverOpts = optionsRef.current?.hover;
    if (hoverOpts?.enabled) {
      if (openTimerRef.current) {
        clearTimeout(openTimerRef.current);
      }
      const delay = hoverOpts.closeDelay ?? 300;
      actions.hoverLeave(key, delay);
    }
  }, [actions, key]);

  const hoverEnabled = Boolean(options?.hover?.enabled);
  const storeIsOpen = useIsPopoverOpen(key);
  const isOpen = explicitIsOpen ?? storeIsOpen;

  return useMemo(() => {
    const ariaProps = {
      'aria-haspopup': 'dialog' as const,
      'aria-expanded': isOpen,
      'aria-controls': `popover-card-${key}`,
    };
    return {
      ...ariaProps,
      onMouseEnter: hoverEnabled ? onMouseEnter : undefined,
      onMouseLeave: hoverEnabled ? onMouseLeave : undefined,
      onClick,
    };
  }, [onClick, onMouseEnter, onMouseLeave, hoverEnabled, isOpen, key]);
}

/**
 * Hook to bind an HTML trigger element to open a root popover.
 *
 * @remarks
 * Injects necessary accessibility attributes (`aria-haspopup="dialog"`, `aria-expanded`, `aria-controls`)
 * and handles click or hover interaction with configurable open/close debounce delays.
 *
 * @example
 * ```tsx
 * import { usePopoverTrigger } from 'popover-trail';
 *
 * function TriggerButton() {
 *   const triggerProps = usePopoverTrigger('userProfile', { placement: 'bottom-start' });
 *   return <button {...triggerProps}>Open Profile</button>;
 * }
 * ```
 *
 * @param key - The unique identifier key for the root popover.
 * @param options - Custom configuration options (placement, hover delays, etc.).
 * @param explicitIsOpen - Optional pre-resolved isOpen boolean flag.
 * @returns Event handler and accessibility props object (e.g. `{ onClick, 'aria-expanded': boolean, ... }`).
 */
export function usePopoverTrigger(
  key: string,
  options?: OpenRootOptions,
  explicitIsOpen?: boolean,
) {
  const actions = usePopoverActions();
  const onOpenHandler = useCallback(
    (e: React.MouseEvent<HTMLElement>, currentTarget: HTMLElement) => {
      const fakeEvent: AnchorEventLike = {
        currentTarget,
        stopPropagation: () => {
          e.stopPropagation?.();
        },
      };
      void actions.openRootWithResolver(key, fakeEvent, options);
    },
    [actions, key, options],
  );

  return usePopoverTriggerBase(key, options, onOpenHandler, explicitIsOpen);
}

/**
 * Hook to bind an HTML trigger element to open a nested child popover in the cascade trail.
 *
 * @remarks
 * Automatically registers the parent-child relationship in the DAG store and computes trigger bounding box
 * coordinates for child positioning.
 *
 * @example
 * ```tsx
 * import { usePopoverNestedTrigger } from 'popover-trail';
 *
 * function NestedLink({ sourceKey }: { sourceKey: string }) {
 *   const triggerProps = usePopoverNestedTrigger('userPermissions', sourceKey);
 *   return <button {...triggerProps}>View Permissions</button>;
 * }
 * ```
 *
 * @param key - The unique identifier key for the child nested popover.
 * @param sourceKey - The unique key of the parent popover spawning this child.
 * @param options - Custom configuration options.
 * @param explicitIsOpen - Optional pre-resolved isOpen boolean flag.
 * @returns Event handler and accessibility props object (e.g. `{ onClick, 'aria-expanded': boolean, ... }`).
 */
export function usePopoverNestedTrigger(
  key: string,
  sourceKey: string,
  options?: OpenNestedOptions,
  explicitIsOpen?: boolean,
) {
  const actions = usePopoverActions();
  const onOpenHandler = useCallback(
    (_e: React.MouseEvent<HTMLElement>, currentTarget: HTMLElement) => {
      const rect = currentTarget.getBoundingClientRect();
      void actions.openNestedWithResolver(key, sourceKey, {
        ...options,
        triggerRect: rect,
      });
    },
    [actions, key, sourceKey, options],
  );

  return usePopoverTriggerBase(key, options, onOpenHandler, explicitIsOpen);
}
