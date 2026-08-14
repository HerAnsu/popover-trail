'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Check global target existence before attaching document/window event listeners',
      category: 'Observers & Listeners',
      recommended: true,
    },
    schema: [],
    messages: {
      uncheckedTarget: 'Verify target object existence before attaching event listener.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.callee.object &&
          node.callee.object.type === 'Identifier' &&
          node.callee.object.name === 'el' &&
          !node.callee.optional
        ) {
          context.report({ node, messageId: 'uncheckedTarget' });
        }
      },
    };
  },
};
