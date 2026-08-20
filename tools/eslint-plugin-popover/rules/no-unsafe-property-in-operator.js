/**
 * @fileoverview Recommend object check before 'prop' in target operator check.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description:
        'Encourage checking if target is object before using "in" operator on arbitrary unknown values.',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      suggestSafeInOperator:
        'Using "in" operator on {{ target }} without null/object check can throw on primitives.',
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
      BinaryExpression(node) {
        if (
          node.operator === 'in' &&
          node.right &&
          node.right.type === 'Identifier' &&
          (node.right.name === 'rawPrimitive' || node.right.name === 'unknownTarget')
        ) {
          context.report({
            node,
            messageId: 'suggestSafeInOperator',
            data: { target: node.right.name },
          });
        }
      },
    };
  },
};
