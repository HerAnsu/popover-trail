'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Ensure scale transform parameters stay within realistic optical boundaries (0.2 to 3.0)',
      category: 'Transitions',
      recommended: true,
    },
    schema: [],
    messages: {
      extremeScale: 'Scale transform factor `{{value}}` is outside recommended range (0.2 to 3.0).',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'scale' || node.key.name === 'initialScale') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          (node.value.value < 0.2 || node.value.value > 3.0)
        ) {
          context.report({ node, messageId: 'extremeScale', data: { value: node.value.value } });
        }
      },
    };
  },
};
