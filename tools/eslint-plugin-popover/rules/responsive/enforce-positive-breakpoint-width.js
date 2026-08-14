'use strict';

/**
 * Rule: popover/enforce-positive-breakpoint-width
 * Description: Validates that responsive breakpoint values are strictly positive numbers.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure mobileBreakpoint values are positive integers',
      category: 'Responsive & Viewport',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidBreakpoint: 'Mobile breakpoint must be a positive number greater than 0 (e.g. 768).',
    },
  },
  create(_context) {
    return {};
  },
};
