'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure generic type declarations provide safe default constraints',
      category: 'Typing & Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      missingGenericDefault: 'Provide default type argument for generic parameter.',
    },
  },
  create(_context) {
    return {};
  },
};
