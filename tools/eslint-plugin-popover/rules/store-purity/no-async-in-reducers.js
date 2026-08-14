'use strict';

/**
 * Rule: popover/no-async-in-reducers
 * Description: Prohibits declaring async functions or returning promises inside synchronous state reducers.
 */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow async functions or Promise returns in state reducers',
      category: 'Store Purity',
      recommended: true,
    },
    schema: [],
    messages: {
      asyncReducer: 'Reducers in `reducers/` must be synchronous. Use store controllers or resolver pipelines for asynchronous workflows.',
    },
  },
  create(context) {
    const rawFilename = context.filename || context.getFilename();
    if (!rawFilename.includes('reducers/')) {
      return {};
    }

    return {
      FunctionDeclaration(node) {
        if (node.async) {
          context.report({
            node,
            messageId: 'asyncReducer',
          });
        }
      },
      ArrowFunctionExpression(node) {
        if (node.async) {
          context.report({
            node,
            messageId: 'asyncReducer',
          });
        }
      },
    };
  },
};
