'use strict';
export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow positive tabIndex values to maintain natural keyboard navigation',
      category: 'Focus Trap & A11y',
      recommended: true,
    },
    schema: [],
    messages: {
      positiveTabIndex: 'Avoid positive tabIndex values (`tabIndex > 0`). Use 0 for focusable or -1 for programmatic focus.',
    },
  },
  create(context) {
    return {
      JSXAttribute(node) {
        if (
          node.name &&
          (node.name.name === 'tabIndex' || node.name.name === 'tabindex') &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression &&
          node.value.expression.type === 'Literal' &&
          typeof node.value.expression.value === 'number' &&
          node.value.expression.value > 0
        ) {
          context.report({
            node,
            messageId: 'positiveTabIndex',
          });
        }
      },
    };
  },
};
