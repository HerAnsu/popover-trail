/**
 * @fileoverview Require error handler on async queue flush promises.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Require catch handler on task queue drain promises.',
      category: 'Concurrency',
      recommended: true,
    },
    schema: [],
    messages: {
      catchQueueRejection: 'Attach .catch() to task queue drain promise.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('queue') && !filename.includes('Queue')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'drain' &&
          node.parent &&
          node.parent.type === 'ExpressionStatement'
        ) {
          context.report({
            node,
            messageId: 'catchQueueRejection',
          });
        }
      },
    };
  },
};
