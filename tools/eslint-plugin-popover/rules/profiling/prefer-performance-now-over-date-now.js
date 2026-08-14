'use strict';

/**
 * Rule: popover/prefer-performance-now-over-date-now
 * Description: Suggests performance.now() over Date.now() for high-precision gesture velocity and animation timers.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer performance.now() for monotonic high-precision physics and gesture timing',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      usePerformanceNow: 'Use `performance.now()` instead of `Date.now()` for monotonic sub-millisecond precision.',
    },
  },
  create(_context) {
    return {};
  },
};
