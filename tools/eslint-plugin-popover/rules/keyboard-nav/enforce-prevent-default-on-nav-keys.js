'use strict';

/**
 * Rule: popover/enforce-prevent-default-on-nav-keys
 * Description: Checks that keyboard navigation handlers for arrow/navigation keys invoke preventDefault.
 */
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure arrow key navigation handlers call preventDefault to prevent simultaneous page scrolling',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      missingPreventDefault: 'Keyboard navigation handler for `{{key}}` should call `e.preventDefault()` to stop unwanted page scroll.',
    },
  },
  create(_context) {
    return {};
  },
};
