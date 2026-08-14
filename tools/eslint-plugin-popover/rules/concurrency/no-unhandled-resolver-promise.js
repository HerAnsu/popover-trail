'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure async resolver pipelines handle errors with .catch() or Result.fromPromise()',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      unhandledPromise: 'Async resolver pipeline should handle errors with .catch() or Result.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'then' &&
          node.parent &&
          node.parent.type === 'ExpressionStatement'
        ) {
          // Floating .then() without .catch()
          context.report({ node, messageId: 'unhandledPromise' });
        }
      },
    };
  },
};
