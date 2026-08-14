/**
 * @fileoverview Disallow async calls or fetch operations inside pure reducer functions.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce pure state transformations in reducers by disallowing fetch or timer side effects.',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      noSideEffectsInReducer: 'Reducer function must be pure and synchronous; side-effect {{ method }} is forbidden.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('reducers/')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'fetch' ||
            node.callee.name === 'setTimeout' ||
            node.callee.name === 'setInterval')
        ) {
          context.report({
            node,
            messageId: 'noSideEffectsInReducer',
            data: { method: node.callee.name },
          });
        }
      },
    };
  },
};
