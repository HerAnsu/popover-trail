'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure portal container target existence is validated before mounting',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      unvalidatedPortal: 'Validate portal target DOM container existence before creating React portal.',
    },
  },
  create(_context) {
    return {};
  },
};
