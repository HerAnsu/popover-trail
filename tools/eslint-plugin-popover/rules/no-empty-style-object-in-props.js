/**
 * @fileoverview Disallow inline empty style={} objects to prevent unnecessary object allocation.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Disallow passing empty object literal style={{}} in JSX.',
      category: 'Performance',
      recommended: true,
    },
    schema: [],
    messages: {
      noEmptyStyleObj: 'Avoid style=\\{\\{\\}\\} as it allocates a new object reference on every render; omit style prop instead.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'style' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression &&
          node.value.expression.type === 'ObjectExpression' &&
          node.value.expression.properties.length === 0
        ) {
          context.report({
            node,
            messageId: 'noEmptyStyleObj',
          });
        }
      },
    };
  },
};
