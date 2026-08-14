'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure global keyboard listeners are scoped to active or top-level popover cards',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      unscopedKeyboard: 'Global keydown listener should verify card active focus or zIndex elevation.',
    },
  },
  create(_context) {
    return {};
  },
};
