/**
 * @fileoverview Require clearing intervals before terminating Web Workers.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce clearInterval before self.close() in Web Workers.',
      category: 'Memory',
      recommended: true,
    },
    schema: [],
    messages: {
      requireClearIntervalInWorker: 'Worker script sets interval without clearing it before self.close().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('worker') && !filename.includes('Worker')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'close' &&
          node.callee.object &&
          node.callee.object.name === 'self'
        ) {
          const src = context.getSourceCode ? context.getSourceCode().getText() : '';
          if (src.includes('setInterval(') && !src.includes('clearInterval(')) {
            context.report({
              node,
              messageId: 'requireClearIntervalInWorker',
            });
          }
        }
      },
    };
  },
};
