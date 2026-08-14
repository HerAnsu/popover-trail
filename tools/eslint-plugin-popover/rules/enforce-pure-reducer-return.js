'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure store reducers are pure functions returning state patches',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      impureReducer: 'Reducer function in store should be pure and not call Math.random or Date.now.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename();
    if (!filename.includes('reducers/')) return {};
    return {
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.type === 'MemberExpression' &&
          node.callee.object &&
          node.callee.object.name === 'Math' &&
          node.callee.property &&
          node.callee.property.name === 'random'
        ) {
          context.report({ node, messageId: 'impureReducer' });
        }
      },
    };
  },
};
