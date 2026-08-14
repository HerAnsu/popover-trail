/**
 * @fileoverview Recommend object check before 'prop' in target operator check.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage checking if target is object before using "in" operator on arbitrary unknown values.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestSafeInOperator: 'Consider guarding "in" operator check with target && typeof target === "object".',
    },
  },
  create(_context) {
    return {
      BinaryExpression(_node) {
        // Safe in-operator guideline
      },
    };
  },
};
