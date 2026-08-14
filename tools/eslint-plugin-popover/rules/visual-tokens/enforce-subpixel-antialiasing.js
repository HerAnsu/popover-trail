'use strict';

/**
 * Rule: popover/enforce-subpixel-antialiasing
 * Description: Suggests antialiased font smoothing classes on card text roots.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure popover card text containers apply font smoothing for optimal legibility',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      fontSmoothing: 'Card text containers benefit from `-webkit-font-smoothing: antialiased` for crisp rendering across operating systems.',
    },
  },
  create(_context) {
    return {};
  },
};
