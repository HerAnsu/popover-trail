import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useIsPopoverOpen, usePopoverActions } from '../context';
import type { AnchorEventLike, OpenNestedOptions, OpenRootOptions, PopoverDisplayOptions } from '../types';

function usePopoverTriggerBase<TOptions extends PopoverDisplayOptions>(
  key: string,
  options: TOptions | undefined,
  onOpenHandler: (e: React.MouseEvent<HTMLElement>, currentTarget: HTMLElement) => void,
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
  const isOpen = useIsPopoverOpen(key);

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
 * Hook to simplify binding an HTML element click trigger to open a root popover.
 *
 * @param key - The unique identifier key for the root popover.
 * @param options - Custom configuration options.
 * @returns Event handler props object (e.g. `{ onClick }`).
 */
export function usePopoverTrigger(key: string, options?: OpenRootOptions) {
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

  return usePopoverTriggerBase(key, options, onOpenHandler);
}

/**
 * Hook to simplify binding an HTML element click trigger to open a nested child popover.
 *
 * @param key - The unique identifier key for the nested popover.
 * @param sourceKey - The unique key of the parent popover spawning this child.
 * @param options - Custom configuration options.
 * @returns Event handler props object (e.g. `{ onClick }`).
 */
export function usePopoverNestedTrigger(
  key: string,
  sourceKey: string,
  options?: OpenNestedOptions,
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

  return usePopoverTriggerBase(key, options, onOpenHandler);
}
