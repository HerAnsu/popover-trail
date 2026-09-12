/**
 * Types and contracts for popover cache React hooks.
 *
 * @module hooks/usePopoverCacheTypes
 */

import type { PopoverCache } from '../types';
import type { CacheStats, SWRFetchOptions } from '../utils/cache';

export interface UsePopoverCacheResult<TData = unknown> {
  readonly cache?: PopoverCache<TData>;
  get(key: string): TData | Promise<TData> | undefined;
  set(key: string, data: TData, ttlMs?: number): void;
  mutate(key: string, updater: TData | ((prev: TData | undefined) => TData)): TData | undefined;
  invalidate(key?: string): void;
  invalidatePrefix(prefix: string): number;
  invalidateTags(tags: string | readonly string[]): number;
  invalidateBranch(
    rootKey: string,
    getChildren: (key: string) => Iterable<string> | undefined,
  ): number;
  touch(key: string, extensionMs?: number): boolean;
  getStats(): CacheStats | undefined;
}

export interface ExtendedCache<TData> extends PopoverCache<TData> {
  mutate?: (key: string, updater: TData | ((prev: TData | undefined) => TData)) => TData;
  invalidatePrefix?: (prefix: string) => number;
  invalidateTags?: (tags: string | readonly string[]) => number;
  invalidateBranch?: (rootKey: string, getChildren: unknown) => number;
  touch?: (key: string, opts?: unknown) => boolean;
  stats?: () => CacheStats;
}

export interface UsePopoverCacheValueOptions<TData> extends SWRFetchOptions {
  readonly initialData?: TData;
  readonly revalidateOnMount?: boolean;
  readonly revalidateOnFocus?: boolean;
  readonly revalidateOnReconnect?: boolean;
}

export interface UsePopoverCacheValueResult<TData> {
  readonly data: TData | undefined;
  readonly isLoading: boolean;
  readonly isStale: boolean;
  readonly error: unknown;
  mutate(updater: TData | ((prev: TData | undefined) => TData)): TData | undefined;
  revalidate(): Promise<TData | undefined>;
}

export interface SWRCompatibleCache<TData> {
  getOrSet?: (key: string, fetcher: () => Promise<TData>, opts?: SWRFetchOptions) => Promise<TData>;
  isStale?: (key: string) => boolean;
  subscribe?: (key: string, listener: (value: TData | undefined) => void) => () => void;
}

export function isSWRCompatibleCache<TData>(
  cache: unknown,
): cache is PopoverCache<TData> & SWRCompatibleCache<TData> {
  return typeof cache === 'object' && cache !== null;
}

export function asSWRCompatibleCache<TData>(
  cache?: PopoverCache<TData>,
): (PopoverCache<TData> & SWRCompatibleCache<TData>) | undefined {
  return isSWRCompatibleCache<TData>(cache) ? cache : undefined;
}

export function isExtendedCache<TData>(
  cache: unknown,
): cache is ExtendedCache<TData> {
  return typeof cache === 'object' && cache !== null;
}
