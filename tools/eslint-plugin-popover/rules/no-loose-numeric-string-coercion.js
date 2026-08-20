/**
 * @fileoverview Recommend Number() or parseInt() over unary plus +str for numeric parsing.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage explicit Number(val) or parseInt(val, 10) instead of unary plus +val operator.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      useExplicitNumberParse:
        'Avoid unary plus (+{{ arg }}) for type coercion; use Number({{ arg }}) or parseInt({{ arg }}, 10).',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (
      filename.includes('eslint-plugin') ||
      filename.includes('rules/') ||
      filename.includes('.test.') ||
      filename.includes('tests/')
    )
      return {};

    return {
      UnaryExpression(node) {
        if (
          node.operator === '+' &&
          node.argument &&
          node.argument.type === 'Identifier' &&
          (node.argument.name.endsWith('Str') || node.argument.name.endsWith('String'))
        ) {
          context.report({
            node,
            messageId: 'useExplicitNumberParse',
            data: { arg: node.argument.name },
          });
        }
      },
    };
  },
};
