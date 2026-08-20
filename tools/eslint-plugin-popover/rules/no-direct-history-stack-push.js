'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow direct mutation of history stack arrays',
      category: 'History & Snapshots',
      recommended: true,
    },
    schema: [],
    messages: {
      directHistoryMutation:
        'Direct mutation of `history.{{stack}}` is prohibited. Use push(), undo(), or redo() methods.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          ['push', 'splice'].includes(node.callee.property.name) &&
          node.callee.object &&
          node.callee.object.type === 'MemberExpression' &&
          node.callee.object.object &&
          node.callee.object.object.name === 'history'
        ) {
          context.report({
            node,
            messageId: 'directHistoryMutation',
            data: { stack: node.callee.object.property.name },
          });
        }
      },
    };
  },
};
