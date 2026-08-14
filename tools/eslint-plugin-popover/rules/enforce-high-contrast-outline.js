'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure focus indicators provide sufficient visual contrast',
      category: 'Visual & Tokens',
      recommended: true,
    },
    schema: [],
    messages: {
      visibleFocusOutline: 'Ensure focus-visible outline is defined and not set to `none` without ring styling.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'outline' || node.key.value === 'outline') &&
          node.value &&
          node.value.type === 'Literal' &&
          node.value.value === 'none'
        ) {
          context.report({ node, messageId: 'visibleFocusOutline' });
        }
      },
    };
  },
};
