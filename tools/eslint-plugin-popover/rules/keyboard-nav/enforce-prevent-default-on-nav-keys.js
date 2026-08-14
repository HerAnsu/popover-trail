'use strict';
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
      missingPreventDefault: 'Keyboard navigation handler for arrow keys should call `e.preventDefault()`.',
    },
  },
  create(_context) {
    return {};
  },
};
