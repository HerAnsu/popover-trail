'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow non-positive damping coefficient in spring physics configuration',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      zeroDamping: 'Spring damping ratio must be greater than 0 to guarantee animation settling.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'damping' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value <= 0
        ) {
          context.report({ node, messageId: 'zeroDamping' });
        }
      },
    };
  },
};
