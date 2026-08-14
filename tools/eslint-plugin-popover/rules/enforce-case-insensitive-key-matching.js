'use strict';
module.exports = {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Ensure keyboard shortcut matching handles canonical casing',
      category: 'Keyboard Navigation',
      recommended: true,
    },
    schema: [],
    messages: {
      shortcutCasing: 'Keyboard key matching for `{{key}}` should use canonical TitleCase `{{canonical}}`.',
    },
  },
  create(context) {
    return {
      BinaryExpression(node) {
        if (
          node.operator === '===' &&
          node.left &&
          node.left.property &&
          node.left.property.name === 'key' &&
          node.right &&
          node.right.type === 'Literal'
        ) {
          if (node.right.value === 'escape') {
            context.report({ node, messageId: 'shortcutCasing', data: { key: 'escape', canonical: 'Escape' } });
          } else if (node.right.value === 'enter') {
            context.report({ node, messageId: 'shortcutCasing', data: { key: 'enter', canonical: 'Enter' } });
          }
        }
      },
    };
  },
};
