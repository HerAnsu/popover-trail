'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure cross-tab storage event listeners filter by target key',
      category: 'Storage & Sync',
      recommended: true,
    },
    schema: [],
    messages: {
      unfilteredStorageEvent: 'Storage event listener should check `e.key === targetKey` before re-hydrating store state.',
    },
  },
  create(context) {
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.property &&
          node.callee.property.name === 'addEventListener' &&
          node.arguments.length >= 2 &&
          node.arguments[0].value === 'storage'
        ) {
          const handler = node.arguments[1];
          if (handler && (handler.type === 'ArrowFunctionExpression' || handler.type === 'FunctionExpression')) {
            const param = handler.params[0] ? handler.params[0].name : null;
            const src = context.getSourceCode ? context.getSourceCode().getText(handler) : '';
            if (param && !src.includes(`${param}.key`)) {
              context.report({ node, messageId: 'unfilteredStorageEvent' });
            }
          }
        }
      },
    };
  },
};
