'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure focus indicators provide sufficient visual contrast',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      visibleFocusOutline: 'Ensure focus-visible outline has sufficient contrast against popover background.',
    },
  },
  create(_context) {
    return {};
  },
};
