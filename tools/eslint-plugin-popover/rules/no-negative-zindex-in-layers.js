'use strict';
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow negative zIndex in popover layer elevations',
      category: 'Portal & Stacking',
      recommended: true,
    },
    schema: [],
    messages: {
      negativeZIndex: 'Negative zIndex is disallowed. Popover layers must be positive integers.',
    },
  },
  create(context) {
    return {
      Property(node) {
        if (
          node.key &&
          (node.key.name === 'zIndex' || node.key.value === 'zIndex') &&
          node.value &&
          node.value.type === 'Literal' &&
          typeof node.value.value === 'number' &&
          node.value.value < 0
        ) {
          context.report({ node, messageId: 'negativeZIndex' });
        }
      },
    };
  },
};
