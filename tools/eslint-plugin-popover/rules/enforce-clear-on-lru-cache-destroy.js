'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cache data structures implement clear() for lifecycle cleanup',
      category: 'Memory & GC',
      recommended: true,
    },
    schema: [],
    messages: {
      missingClearMethod:
        'Cache structure should provide a `clear()` or `reset()` method for memory management.',
    },
  },
  create(context) {
    return {
      ClassDeclaration(node) {
        if (node.id && node.id.name.endsWith('Cache')) {
          const hasClear =
            node.body &&
            node.body.body &&
            node.body.body.some((m) => m.key && (m.key.name === 'clear' || m.key.name === 'reset'));
          if (!hasClear) {
            context.report({ node, messageId: 'missingClearMethod' });
          }
        }
      },
    };
  },
};
