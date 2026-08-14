'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow storing raw HTMLElement or DOM references directly in persistent store state',
      category: 'Geometry & Coordinates',
      recommended: true,
    },
    schema: [],
    messages: {
      domInStore: 'Do not store raw HTMLElement references in persistent store state. Store rects or string IDs instead.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('store/')) return {};
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'element' || node.key.name === 'domNode' || node.key.name === 'containerElement') &&
          node.value &&
          node.value.type === 'Identifier' &&
          node.value.name === 'element'
        ) {
          // Flagging storing element reference in state record
          context.report({ node, messageId: 'domInStore' });
        }
      },
    };
  },
};
