/**
 * @fileoverview Disallow synchronous localStorage access inside drag movement handlers.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow calling localStorage.setItem during active pointer drag or mousemove ticks.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noSyncStorageInDrag: 'Synchronous localStorage I/O in drag event handlers causes frame drops. Debounce or save on dragEnd.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('drag') && !filename.includes('pointer')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.object &&
          node.callee.object.name === 'localStorage' &&
          (node.callee.property.name === 'setItem' || node.callee.property.name === 'getItem')
        ) {
          context.report({
            node,
            messageId: 'noSyncStorageInDrag',
          });
        }
      },
    };
  },
};
