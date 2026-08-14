'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure boundary collision padding values are non-negative numbers',
      category: 'Floating UI',
      recommended: true,
    },
    schema: [],
    messages: {
      negativePadding: 'Collision padding must be non-negative (>= 0).',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'padding' || node.key.name === 'collisionPadding') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value < 0
        ) {
          context.report({ node, messageId: 'negativePadding' });
        }
      },
    };
  },
};
