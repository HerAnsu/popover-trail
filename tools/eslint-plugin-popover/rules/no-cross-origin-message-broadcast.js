'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow wildcard targetOrigin in window.postMessage communications',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      wildcardPostMessage:
        'Avoid `postMessage(data, "*")`. Specify explicit target origin or use window.location.origin.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.property &&
          node.callee.property.name === 'postMessage' &&
          node.arguments.length >= 2 &&
          node.arguments[1].type === 'Literal' &&
          node.arguments[1].value === '*'
        ) {
          context.report({ node, messageId: 'wildcardPostMessage' });
        }
      },
    };
  },
};
