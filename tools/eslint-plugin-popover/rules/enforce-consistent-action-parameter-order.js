/**
 * @fileoverview Recommend (key, payload, options) ordering in action dispatcher functions.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage consistent (key, payload, options) parameter ordering across all store action methods.',
      category: 'Clean Code',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestParamOrder: 'Action parameter order in {{ name }} should follow (key, payload, options) convention.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      MethodDefinition(node) {
        if (
          node.value &&
          node.value.params &&
          node.value.params.length >= 2 &&
          node.value.params[0].name === 'payload' &&
          node.value.params[1].name === 'key'
        ) {
          context.report({
            node,
            messageId: 'suggestParamOrder',
            data: { name: node.key?.name || 'action' },
          });
        }
      },
    };
  },
};
