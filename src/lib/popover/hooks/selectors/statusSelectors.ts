/**
 * Status & Configuration Selector Hooks for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/statusSelectors
 */

import type { PopoverStore } from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import { selectIsPinned, selectHasEntry } from '../../store/selectors';
import type { RegisteredKeys } from '../../types/registerTypes';

export function useIsPopoverPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectIsPinned(key));
}

export const usePopoverIsPinned = useIsPopoverPinned;

export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

export function useIsPopoverTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(
    (state) => state.zIndexOrder.length > 0 && state.zIndexOrder.at(-1) === key,
  );
}

export const usePopoverIsTopMost = useIsPopoverTopMost;

export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore((state: PopoverStore<unknown, TContext>) => state.context);
}

export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}

export function useIsPopoverOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(selectHasEntry(key));
}

export const usePopoverIsOpen = useIsPopoverOpen;
