/**
 * @fileoverview Recommend checking for null element when handling React ref callback hooks.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage handling null cleanup in React ref callbacks (node === null on unmount).',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestNullRefCheck: 'Ref callback function {{ name }} should check for null element when DOM unmounts.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('eslint-plugin') || filename.includes('rules/') || filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      JSXAttribute(node) {
        if (
          node.name &&
          node.name.name === 'ref' &&
          node.value &&
          node.value.type === 'JSXExpressionContainer' &&
          node.value.expression &&
          (node.value.expression.type === 'ArrowFunctionExpression' || node.value.expression.type === 'FunctionExpression')
        ) {
          const body = context.getSourceCode ? context.getSourceCode().getText(node.value.expression) : '';
          if (body.includes('.focus(') && !body.includes('if (!') && !body.includes('if (') && !body.includes('?.') && !body.includes('null')) {
            context.report({
              node,
              messageId: 'suggestNullRefCheck',
              data: { name: 'ref' },
            });
          }
        }
      },
    };
  },
};
