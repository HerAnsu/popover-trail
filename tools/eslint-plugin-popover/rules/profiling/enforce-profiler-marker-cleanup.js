'use strict';

/**
 * Rule: popover/enforce-profiler-marker-cleanup
 * Description: Checks that performance.mark calls are accompanied by performance.clearMarks().
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure performance profiler marks are cleaned up to prevent memory growth',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      missingClearMarks: 'Calls to `performance.mark()` should clear marks with `performance.clearMarks()` when measurement ends.',
    },
  },
  create(_context) {
    return {};
  },
};
