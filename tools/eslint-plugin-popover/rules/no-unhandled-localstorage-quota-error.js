'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure localStorage operations handle QuotaExceededError in private browsing modes',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unhandledStorageQuota:
        'Wrap `localStorage.setItem()` in try/catch to handle private-mode quota limits.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'localStorage' &&
          node.callee.property &&
          node.callee.property.name === 'setItem'
        ) {
          let parent = node.parent;
          let inTry = false;
          while (parent) {
            if (parent.type === 'TryStatement') {
              inTry = true;
              break;
            }
            parent = parent.parent;
          }
          if (!inTry) {
            context.report({ node, messageId: 'unhandledStorageQuota' });
          }
        }
      },
    };
  },
};
