'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure stack group identifiers are non-empty strings',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidGroupId: 'Stack group identifier should be a non-empty string.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'groupId' &&
          node.value &&
          node.value.type === 'Literal' &&
          node.value.value === ''
        ) {
          context.report({ node, messageId: 'invalidGroupId' });
        }
      },
    };
  },
};
