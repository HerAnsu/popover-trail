/**
 * @fileoverview Enforce clearing object properties before returning item to ObjectPool.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Enforce resetting pooled object properties to blank initial state upon release.',
      category: 'Object Pool',
      recommended: true,
    },
    schema: [],
    messages: {
      requirePoolReset: 'Pooled object should be reset or cleared before pushing to free list in release().',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('objectPool') && !filename.includes('ObjectPool')) return {};

    return {
      MethodDefinition(node) {
        if (node.key && node.key.name === 'release') {
          const body = context.getSourceCode ? context.getSourceCode().getText(node) : '';
          if (body && !body.includes('reset') && !body.includes('clear') && !body.includes('length = 0')) {
            context.report({
              node,
              messageId: 'requirePoolReset',
            });
          }
        }
      },
    };
  },
};
