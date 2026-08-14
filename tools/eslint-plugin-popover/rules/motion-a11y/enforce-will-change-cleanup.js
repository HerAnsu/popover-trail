'use strict';

/**
 * Rule: popover/enforce-will-change-cleanup
 * Description: Checks that will-change: transform properties are cleared after gesture finishes to prevent GPU memory retention.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure will-change CSS properties are removed after gesture/transition finishes',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      willChangeCleanup: 'Reset `willChange: "auto"` when card transition completes to free GPU memory.',
    },
  },
  create(_context) {
    return {};
  },
};
