'use strict';
export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure transition durations are positive finite numbers',
      category: 'Transitions',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidDuration: 'Transition duration must be a positive number (ms).',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'transitionDuration' || node.key.name === 'duration') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value < 0
        ) {
          context.report({ node, messageId: 'invalidDuration' });
        }
      },
    };
  },
};
