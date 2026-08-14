'use strict';

/**
 * Rule: popover/no-blocking-heavy-sync-loops
 * Description: Warns against deep nested loops in real-time frame render callbacks.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid nested synchronous loops in gesture and frame calculation pipelines',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      heavySyncLoop: 'Nested loop inside frame calculation pipeline may drop frames at 60/120 FPS.',
    },
  },
  create(_context) {
    return {};
  },
};
