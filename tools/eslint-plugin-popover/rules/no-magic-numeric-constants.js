/**
 * @fileoverview Recommend defining named constants for magic timeout numbers > 500ms.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage named constants for magic timeout and interval millisecond durations.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestNamedConstant: 'Consider extracting magic duration {{ val }}ms into a named constant in constants.ts.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('constants')) return {};

    return {
      CallExpression(node) {
        if (
          node.callee &&
          (node.callee.name === 'setTimeout' || node.callee.name === 'setInterval') &&
          node.arguments[1] &&
          node.arguments[1].type === 'Literal' &&
          typeof node.arguments[1].value === 'number' &&
          node.arguments[1].value >= 5000
        ) {
          context.report({
            node: node.arguments[1],
            messageId: 'suggestNamedConstant',
            data: { val: node.arguments[1].value },
          });
        }
      },
    };
  },
};
