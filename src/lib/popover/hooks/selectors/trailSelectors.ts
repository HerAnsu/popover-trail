/**
 * Trail & Hierarchy Selector Hooks for popover-trail.
 * Clean Architecture Layer 3: Reactive Integration & Hooks.
 *
 * @module hooks/selectors/trailSelectors
 */

import type { TrailEntry } from '../../types';
import { usePopoverStore } from '../../context/usePopoverStore';
import {
  selectActiveTrail,
  selectFloatingEntries,
  selectRootEntry,
  selectParentKey,
  selectChildrenKeys,
  selectBreadcrumbs,
  selectPopoverDepth,
} from '../../store/selectors';
import type { RegisteredKeys, RegisteredDataMap } from '../../types/registerTypes';
import { shallowEqual } from '../../utils/equality';

export function usePopoverTrail<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): readonly TrailEntry<TData, TPopoverKey>[] {
  return usePopoverStore(selectActiveTrail<TData, TPopoverKey>);
}

export function usePopoverFloating<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): readonly TrailEntry<TData, TPopoverKey>[] {
  return usePopoverStore(selectFloatingEntries<TData, TPopoverKey>);
}

export function usePopoverRootEntry<
  TData = RegisteredDataMap[RegisteredKeys],
  TPopoverKey extends string = RegisteredKeys,
>(): TrailEntry<TData, TPopoverKey> | undefined {
  return usePopoverStore(selectRootEntry<TData, TPopoverKey>);
}


export function usePopoverTotalActiveCount(): number {
  return usePopoverStore((state) => state.floating.length + state.trail.length);
}

export function useIsPopoverIdle(): boolean {
  return usePopoverStore((state) => state.floating.length === 0 && state.trail.length === 0);
}

export const usePopoverIsIdle = useIsPopoverIdle;

export function usePopoverParentKey<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): TPopoverKey | undefined {
  return usePopoverStore(selectParentKey<TPopoverKey>(key));
}

export function usePopoverChildrenKeys<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return usePopoverStore(selectChildrenKeys<TPopoverKey>(key), shallowEqual);
}

export function usePopoverBreadcrumbs<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): readonly TPopoverKey[] {
  return usePopoverStore(selectBreadcrumbs<TPopoverKey>(key), shallowEqual);
}

export function usePopoverDepth<TPopoverKey extends string = RegisteredKeys>(
  key: TPopoverKey,
): number {
  return usePopoverStore(selectPopoverDepth<TPopoverKey>(key));
}
