/**
 * @fileoverview Disallow async functions as reducer functions.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description:
        'Disallow async keyword on reducer functions; reducers must be pure synchronous state transitions.',
      category: 'Store Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noAsyncReducer:
        'Reducer function {{ name }} must be synchronous; async operations belong in action controllers.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('reducer')
    )
      return {};

    return {
      FunctionDeclaration(node) {
        if (
          node.async &&
          node.id &&
          (node.id.name.includes('Reducer') || node.id.name.startsWith('reduce'))
        ) {
          context.report({
            node,
            messageId: 'noAsyncReducer',
            data: { name: node.id.name },
          });
        }
      },
    };
  },
};
