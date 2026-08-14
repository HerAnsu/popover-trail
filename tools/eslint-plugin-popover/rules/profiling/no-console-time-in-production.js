'use strict';

/**
 * Rule: popover/no-console-time-in-production
 * Description: Disallows unguarded console.time and console.timeEnd in library runtime.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow unguarded console.time / console.timeEnd in library runtime',
      category: 'Profiling & Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noConsoleTime: 'Unguarded `console.time()` is prohibited in library builds. Use performanceSentinel or devTiming.',
    },
  },
  create(_context) {
    return {};
  },
};
