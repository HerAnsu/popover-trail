/**
 * Collection Helpers for Searching and Querying Trail Lists.
 * Clean Architecture Layer 1: Core Kernel (Pure Functional Domain).
 *
 * @module utils/collections
 */

import type { TrailEntry } from '../types';

export function getEntryAtIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  index: number,
): TrailEntry<TData, TPopoverKey> | undefined {
  if (index < 0 || index >= floating.length + trail.length) return undefined;
  if (index < floating.length) return floating[index];
  return trail[index - floating.length];
}

export function findEntryIndex<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): number {
  const fi = floating.findIndex((e) => e.key === key);
  if (fi !== -1) return fi;
  const ti = trail.findIndex((e) => e.key === key);
  return ti !== -1 ? floating.length + ti : -1;
}

export function hasEntryWithKey<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): boolean {
  return floating.some((e) => e.key === key) || trail.some((e) => e.key === key);
}

export function findEntryInStore<TData, TPopoverKey extends string = string>(
  floating: readonly TrailEntry<TData, TPopoverKey>[],
  trail: readonly TrailEntry<TData, TPopoverKey>[],
  key: string,
): TrailEntry<TData, TPopoverKey> | undefined {
  return floating.find((e) => e.key === key) ?? trail.find((e) => e.key === key);
}
