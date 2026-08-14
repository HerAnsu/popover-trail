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
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'setTimeout' && node.arguments.length >= 2) {
          const delay = node.arguments[1];
          if (delay && delay.type === 'Literal' && typeof delay.value === 'number' && delay.value > 60000) {
            context.report({ node, messageId: 'closureLeakWarning' });
          }
        }
      },
    };
  },
};
