/**
 * Scoped Optimistic State Subscriptions for Popover Card Components.
 * Integrates React 19 `useOptimistic` directly into the popover trail hierarchy.
 *
 * @module hooks/usePopoverOptimistic
 */

import { useCrossVersionOptimistic } from '../utils/react19Adapters';
import { usePopoverCardScope } from '../context/PopoverCardScopeContext';

/**
 * Hook providing optimistic state updates scoped to the active popover card.
 *
 * @example
 * ```tsx
 * const [optimisticTitle, setOptimisticTitle] = usePopoverOptimistic(
 *   cardData.title,
 *   (current, newTitle: string) => newTitle,
 * );
 * ```
 *
 * @template TData - Current confirmed data type.
 * @template TUpdate - Update action or delta payload type.
 * @param currentData - Confirmed data state.
 * @param updateFn - Pure reducer calculating optimistic state.
 * @returns Tuple of [optimisticData, applyOptimisticUpdate].
 */
export function usePopoverOptimistic<TData, TUpdate = Partial<TData>>(
  currentData: TData,
  updateFn: (currentState: TData, update: TUpdate) => TData,
): readonly [TData, (update: TUpdate) => void] {
  return useCrossVersionOptimistic<TData, TUpdate>(currentData, updateFn);
}

/**
 * Hook providing optimistic updates directly bound to the active card's `entry.data` in scope.
 *
 * @example
 * ```tsx
 * function EditableCardTitle() {
 *   const [optimisticUser, updateOptimisticUser] = usePopoverCardOptimistic<UserProfile>(
 *     (user, patch) => ({ ...user!, ...patch }),
 *   );
 *   return <h2>{optimisticUser?.name}</h2>;
 * }
 * ```
 *
 * @template TData - Resolved card data type.
 * @template TUpdate - Optimistic patch payload type.
 * @param updateFn - Reducer calculating optimistic card state.
 * @returns Tuple of [optimisticData, applyOptimisticUpdate].
 */
export function usePopoverCardOptimistic<TData = unknown, TUpdate = Partial<TData>>(
  updateFn: (currentState: TData | undefined, update: TUpdate) => TData,
): readonly [TData | undefined, (update: TUpdate) => void] {
  const { entry } = usePopoverCardScope<TData>();
  return useCrossVersionOptimistic<TData | undefined, TUpdate>(entry.data ?? undefined, updateFn);
}

