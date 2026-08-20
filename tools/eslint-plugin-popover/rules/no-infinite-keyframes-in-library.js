'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow infinite looping CSS animations in default component styles',
      category: 'Motion & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      infiniteAnimation:
        'Infinite animation loops in default card styles can drain battery and violate vestibular a11y.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'animation' || node.key.name === 'animationIterationCount') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'string' &&
          node.value.value.includes('infinite')
        ) {
          context.report({ node, messageId: 'infiniteAnimation' });
        }
      },
    };
  },
};
