'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure undo/redo history buffers have bounded capacity limits',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      unboundedHistory: 'History buffer capacity should be capped with a maximum limit (maxHistory > 0).',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'maxHistory' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value <= 0
        ) {
          context.report({ node, messageId: 'unboundedHistory' });
        }
      },
    };
  },
};
