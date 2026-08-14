'use strict';

/**
 * Rule: popover/no-unfiltered-console-error-in-lib
 * Description: Suggests wrapping library errors in PopoverError or devWarnings rather than direct console.error.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Prefer structured PopoverError or devWarning utility over raw console.error',
      category: 'Diagnostics & Warnings',
      recommended: true,
    },
    schema: [],
    messages: {
      rawConsoleError: 'Use `devWarning` or `Result.err()` instead of direct `console.error` in library core.',
    },
  },
  create(_context) {
    return {};
  },
};
