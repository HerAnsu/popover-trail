'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure mobileBreakpoint values are positive integers',
      category: 'Responsive & Viewport',
      recommended: true,
    },
    schema: [],
    messages: {
      invalidBreakpoint: 'Mobile breakpoint must be a positive number greater than 0 (e.g. 768).',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          node.key.name === 'mobileBreakpoint' &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value <= 0
        ) {
          context.report({ node, messageId: 'invalidBreakpoint' });
        }
      },
    };
  },
};
