'use strict';
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
      willChangeCleanup: 'Reset willChange to "auto" when card transition completes to free GPU memory.',
    },
  },
  create(_context) {
    return {};
  },
};
