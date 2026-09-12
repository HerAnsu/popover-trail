/**
 * Algebraic data types and option contracts for reactive cache queries.
 *
 * @module hooks/usePopoverCacheQueryTypes
 */

export type PopoverCacheQueryState<TData> =
  | {
      readonly status: 'idle';
      readonly data: undefined;
      readonly error: null;
      readonly isStale: false;
      readonly isLoading: false;
    }
  | {
      readonly status: 'loading';
      readonly data: TData | undefined;
      readonly error: null;
      readonly isStale: boolean;
      readonly isLoading: true;
    }
  | {
      readonly status: 'success';
      readonly data: TData;
      readonly error: null;
      readonly isStale: boolean;
      readonly isLoading: false;
    }
  | {
      readonly status: 'error';
      readonly data: TData | undefined;
      readonly error: unknown;
      readonly isStale: boolean;
      readonly isLoading: false;
    };

export interface UsePopoverCacheQueryOptions<TData> {
  readonly enabled?: boolean;
  readonly initialData?: TData;
  readonly ttlMs?: number;
  readonly staleMs?: number;
  readonly retries?: number;
  readonly retryDelayMs?: number;
  readonly revalidateOnMount?: boolean;
  readonly revalidateOnFocus?: boolean;
  readonly revalidateOnReconnect?: boolean;
}

export interface UsePopoverCacheQueryResult<TData> {
  readonly status: PopoverCacheQueryState<TData>['status'];
  readonly data: PopoverCacheQueryState<TData>['data'];
  readonly error: PopoverCacheQueryState<TData>['error'];
  readonly isStale: boolean;
  readonly isLoading: boolean;
  readonly mutate: (updater: TData | ((prev: TData | undefined) => TData)) => TData | undefined;
  readonly revalidate: () => Promise<TData | undefined>;
}

export function computeInitialQueryState<TData>(
  key: string,
  cache: import('../types').PopoverCache<TData> | undefined,
  isEnabled: boolean,
  initialData?: TData,
): PopoverCacheQueryState<TData> {
  if (!isEnabled) {
    return { status: 'idle', data: undefined, error: null, isStale: false, isLoading: false };
  }
  const cached = cache?.get(key);
  const initial = cached instanceof Promise ? initialData : (cached ?? initialData);
  if (initial !== undefined) {
    return { status: 'success', data: initial, error: null, isStale: false, isLoading: false };
  }
  return { status: 'loading', data: undefined, error: null, isStale: false, isLoading: true };
}
