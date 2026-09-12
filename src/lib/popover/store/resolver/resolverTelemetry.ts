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
 * Returns high-resolution timestamp in milliseconds.
 */
export function getPerformanceTimestamp(): number {
  return typeof performance !== 'undefined' && typeof performance.now === 'function'
    ? performance.now()
    : Date.now();
}

/**
 * Creates and dispatches a resolution metric through listeners and event bus.
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
