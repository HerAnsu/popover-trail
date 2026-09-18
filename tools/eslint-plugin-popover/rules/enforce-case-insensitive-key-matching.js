export default {
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
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      BinaryExpression(node) {
        if (
          node.operator === '===' &&
          node.left?.type === 'MemberExpression' &&
          node.left?.property?.name === 'key' &&
          node.right?.type === 'Literal'
        ) {
          if (node.right.value === 'escape') {
            context.report({
              node,
              messageId: 'shortcutCasing',
              data: { key: 'escape', canonical: 'Escape' },
            });
          } else if (node.right.value === 'enter') {
            context.report({
              node,
              messageId: 'shortcutCasing',
              data: { key: 'enter', canonical: 'Enter' },
            });
          }
        }
      },
    };
  },
};
