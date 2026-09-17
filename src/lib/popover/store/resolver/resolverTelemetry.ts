/**
 * High-Performance Telemetry & Metric Dispatcher for Popover Resolver.
 *
 * @module store/resolver/resolverTelemetry
 */

import type { PopoverStoreEvent, ResolutionMetric, ResolutionSource } from '../../types';
import { dispatchStoreEvent, type PopoverEventBus } from '../eventBus';

export interface MetricDispatcher<TData = unknown, TPopoverKey extends string = string> {
  readonly eventListeners?: Set<(event: PopoverStoreEvent<TData, TPopoverKey>) => void>;
  readonly eventBus?: PopoverEventBus<TData, TPopoverKey>;
}

/**
 * Returns a high-resolution timestamp in milliseconds.
 * Falls back to `Date.now()` if `performance.now()` is unavailable.
 *
 * @returns Timestamp in milliseconds.
 *
 * @example
 * ```typescript
 * const start = getPerformanceTimestamp();
 * // ... do work ...
 * const elapsed = getPerformanceTimestamp() - start;
 * ```
 */
export function getPerformanceTimestamp(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/**
 * Creates and dispatches a resolution telemetry metric through registered event listeners and event bus.
 *
 * @template TData - Resolved data payload type.
 * @template _TContext - Ambient context type.
 * @template TPopoverKey - Popover key identifier type.
 * @param dispatcher - Event listener set and event bus carrier.
 * @param key - Popover key identifier.
 * @param source - Resolution source ('sync' | 'async' | 'cache' | 'deduped').
 * @param start - Performance timestamp recorded at start of resolution.
 * @param success - True if resolution succeeded, false if errored.
 * @param error - Optional error object if resolution failed.
 *
 * @example
 * ```typescript
 * recordResolutionMetric(deps, 'card-1', 'async', startTimestamp, true);
 * ```
 */
export function recordResolutionMetric<
  TData = unknown,
  _TContext = unknown,
  TPopoverKey extends string = string,
>(
  dispatcher: MetricDispatcher<TData, TPopoverKey>,
  key: TPopoverKey,
  source: ResolutionSource,
  start: number,
  success: boolean,
  error?: Error,
): void {
  const durationMs = Math.max(0, getPerformanceTimestamp() - start);
  const metric: ResolutionMetric<TPopoverKey> = {
    key,
    source,
    durationMs: Number(durationMs.toFixed(2)),
    timestamp: Date.now(),
    success,
    ...(error ? { error } : {}),
  };

  dispatchStoreEvent(
    dispatcher.eventListeners,
    { type: 'resolve_perf', metric },
    dispatcher.eventBus,
  );
}
