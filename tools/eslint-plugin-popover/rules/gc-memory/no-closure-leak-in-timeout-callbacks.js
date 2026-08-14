'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Avoid capturing excessive outer scope state in long-lived timer closures',
      category: 'Memory & GC',
      recommended: true,
    },
    schema: [],
    messages: {
      closureLeakWarning: 'Pass minimal primitive identifier to timer callback instead of capturing large object scope.',
    },
  },
  create(_context) {
    return {};
  },
};
