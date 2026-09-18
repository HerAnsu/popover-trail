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

/**
 * Evaluates whether a specific popover is pinned to the screen as a detached floating card.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to inspect.
 * @returns True if pinned, false otherwise.
 *
 * @example
 * ```tsx
 * function PinIndicator({ cardKey }: { cardKey: string }) {
 *   const isPinned = usePopoverIsPinned(cardKey);
 *   return <span>{isPinned ? 'Pinned' : 'Floating'}</span>;
 * }
 * ```
 */
export function usePopoverIsPinned<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(selectIsPinned(key));
}

/**
 * Retrieves the 0-based visual stacking order index for a given popover.
 *
 * Returns -1 if the popover is not currently active in the z-index stack.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to look up.
 * @returns 0-based stacking index, or -1 if unmounted.
 *
 * @example
 * ```tsx
 * const stackIndex = usePopoverZIndex('card-details');
 * ```
 */
export function usePopoverZIndex<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(({ zIndexOrder }) => zIndexOrder.indexOf(key));
}

/**
 * Evaluates whether a specific popover is currently the topmost element in the visual stacking order.
 *
 * Useful for highlighting active borders, elevation styling, or delegating keyboard shortcuts.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to check.
 * @returns True if the popover is on top of the visual stack.
 *
 * @example
 * ```tsx
 * function CardContainer({ cardKey }: { cardKey: string }) {
 *   const isTopMost = usePopoverIsTopMost(cardKey);
 *   return <div className={isTopMost ? 'card active' : 'card'} />;
 * }
 * ```
 */
export function usePopoverIsTopMost<TPopoverKey extends string = RegisteredKeys>(key: TPopoverKey) {
  return usePopoverStore(({ zIndexOrder }) => last(zIndexOrder) === key);
}

/**
 * Accesses the global shared context object passed into the root `<PopoverProvider>`.
 *
 * @template TContext - Expected shape of the context object.
 * @returns The ambient context object, or undefined.
 *
 * @example
 * ```tsx
 * interface AppContext {
 *   userId: string;
 *   theme: 'light' | 'dark';
 * }
 * const ctx = usePopoverContext<AppContext>();
 * ```
 */
export function usePopoverContext<TContext = unknown>() {
  return usePopoverStore(({ context }: PopoverStore<unknown, TContext>) => context);
}

/**
 * Retrieves the active collision avoidance and spatial layout configuration from the store.
 *
 * @returns The collision configuration object, or null/undefined if unconfigured.
 *
 * @example
 * ```tsx
 * const collisionConfig = usePopoverCollisionConfig();
 * ```
 */
export function usePopoverCollisionConfig() {
  return usePopoverStore(({ collisionConfig }) => collisionConfig);
}

/**
 * Evaluates whether a popover with the given key is currently open in either the trail or floating pool.
 *
 * @template TPopoverKey - Branded key type.
 * @param key - The popover key to check.
 * @returns True if the popover is currently open.
 *
 * @example
 * ```tsx
 * function TriggerButton({ cardKey }: { cardKey: string }) {
 *   const isOpen = usePopoverIsOpen(cardKey);
 *   return <button>{isOpen ? 'Close' : 'Open'}</button>;
 * }
 * ```
 */
export function usePopoverIsOpen<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): boolean {
  return usePopoverStore(selectHasEntry(key));
}
