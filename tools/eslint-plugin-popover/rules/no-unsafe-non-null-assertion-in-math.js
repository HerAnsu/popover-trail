/**
 * @fileoverview Disallow non-null assertions (!) in math coordinate calculations without fallback.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Disallow non-null assertion operator (!) in vector and geometry math; provide fallback defaults (?? 0).',
      category: 'Type Safety',
      recommended: true,
    },
    schema: [],
    messages: {
      noNonNullInMath: 'Avoid non-null assertion in coordinate math; use fallback "?? 0" to prevent NaN calculations.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (!filename.includes('dragMath') && !filename.includes('geometry')) return {};

    return {
      TSNonNullExpression(node) {
        if (
          node.parent &&
          (node.parent.type === 'BinaryExpression' || node.parent.type === 'AssignmentExpression')
        ) {
          context.report({
            node,
            messageId: 'noNonNullInMath',
          });
        }
      },
    };
  },
};
