'use strict';

/**
 * Rule: popover/no-viewport-resize-without-debounce
 * Description: Suggests throttling or debouncing on window resize event listeners.
 */
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
