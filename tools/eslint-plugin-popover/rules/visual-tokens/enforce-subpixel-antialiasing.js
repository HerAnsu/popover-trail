'use strict';
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
      fontSmoothing: 'Card text containers benefit from `-webkit-font-smoothing: antialiased` for crisp rendering.',
    },
  },
  create(_context) {
    return {};
  },
};
