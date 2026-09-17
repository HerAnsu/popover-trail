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
import { last } from '../../utils/arrayUtils';

export function usePopoverIsPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectIsPinned(key));
}

export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore((state) => state.zIndexOrder.indexOf(key));
}

export function usePopoverIsTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore((state) => last(state.zIndexOrder) === key);
}

export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore((state: PopoverStore<unknown, TContext>) => state.context);
}

export function usePopoverCollisionConfig() {
  return usePopoverStore((state) => state.collisionConfig);
}

export function usePopoverIsOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(selectHasEntry(key));
}
