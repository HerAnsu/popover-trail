/**
 * @fileoverview Recommend error state transitions for async loading FSM nodes.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Recommend an onError transition for async FSM states.',
      category: 'FSM',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestErrorState: 'FSM async state {{ stateName }} should define an onError transition.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      !filename.includes('fsm')
    )
      return {};

    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'loading' &&
          node.value &&
          node.value.type === 'ObjectExpression'
        ) {
          const hasErrorBranch = node.value.properties.some(
            (p) =>
              p.key &&
              (p.key.name === 'onError' || p.key.name === 'ERROR' || p.key.name === 'REJECT'),
          );
          if (!hasErrorBranch) {
            context.report({
              node,
              messageId: 'suggestErrorState',
              data: { stateName: 'loading' },
            });
          }
        }
      },
    };
  },
};
