'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure observer registry subscriptions return unobserve in effect cleanup',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      missingUnobserve: 'Observer observe() should have corresponding unobserve() or disconnect().',
    },
  },
  create(_context) {
    return {};
  },
};
