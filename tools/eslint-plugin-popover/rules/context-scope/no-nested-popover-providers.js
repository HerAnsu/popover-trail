'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Warn against nested unkeyed PopoverProviders that may shadow parent trail states',
      category: 'Context & Store Scoping',
      recommended: true,
    },
    schema: [],
    messages: {
      nestedProvider: 'Avoid nesting <PopoverProvider> without an explicit isolated store configuration.',
    },
  },
  create(_context) {
    return {};
  },
};
