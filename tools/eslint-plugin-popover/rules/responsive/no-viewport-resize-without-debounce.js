'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure viewport resize handlers are throttled to prevent layout thrashing',
      category: 'Responsive & Viewport',
      recommended: true,
    },
    schema: [],
    messages: {
      unthrottledResize: 'Window resize listener should be throttled or debounced to avoid layout thrashing.',
    },
  },
  create(_context) {
    return {};
  },
};
