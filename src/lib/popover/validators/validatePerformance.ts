import { wrapResult } from '../utils/result';

/**
 * Safely creates a performance timing mark if User Timing API is available in the environment.
 * Handled gracefully without throwing if marks are not supported.
 *
 * @param name - Unique mark identifier string.
 *
 * @example
 * ```typescript
 * markPerformance('popover:render:start');
 * ```
 */
export function markPerformance(name: string): void {
  if (typeof performance !== 'undefined' && typeof performance.mark === 'function') {
    wrapResult(() => performance.mark(name));
  }
}

/**
 * Safely records a performance duration measurement between marks and cleans up temporary marks.
 * Handled gracefully without throwing if User Timing API is not supported.
 *
 * @param name - Measurement entry identifier.
 * @param startMark - Name of the starting mark.
 * @param endMark - Optional name of the ending mark (defaults to current timestamp).
 *
 * @example
 * ```typescript
 * markPerformance('op-start');
 * // ... perform operation ...
 * measurePerformance('op-duration', 'op-start');
 * ```
 */
export function measurePerformance(name: string, startMark: string, endMark?: string): void {
  if (typeof performance !== 'undefined' && typeof performance.measure === 'function') {
    wrapResult(() => {
      performance.measure(name, startMark, endMark);
      if (typeof performance.clearMarks === 'function') {
        performance.clearMarks(startMark);
        if (endMark) {
          performance.clearMarks(endMark);
        }
      }
    });
  }
}
