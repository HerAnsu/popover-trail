'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure inertia and fling velocity values are bounded by finite thresholds',
      category: 'Physics & Spatial',
      recommended: true,
    },
    schema: [],
    messages: {
      unclampedVelocity: 'Inertia velocity parameter should be clamped to avoid extreme floating offsets.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'velocity' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          Math.abs(node.value.value) > 10000
        ) {
          context.report({ node, messageId: 'unclampedVelocity' });
        }
      },
    };
  },
};
