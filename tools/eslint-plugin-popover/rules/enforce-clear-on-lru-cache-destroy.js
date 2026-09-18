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
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      ClassDeclaration(node) {
        if (node.id?.name?.endsWith('Cache')) {
          const hasClear = node.body?.body?.some(
            (m) => m.key && (m.key?.name === 'clear' || m.key?.name === 'reset')
          );
          if (!hasClear) {
            context.report({ node, messageId: 'missingClearMethod' });
          }
        }
      },
    };
  },
};
