'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure async effect fetches protect against race conditions with cancellation',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      potentialRaceCondition: 'Async data resolution in useEffect should use an isActive flag or AbortController.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (node.callee && node.callee.name === 'useEffect') {
          const fn = node.arguments[0];
          if (fn && fn.async) {
            context.report({ node, messageId: 'potentialRaceCondition' });
          }
        }
      },
    };
  },
};
