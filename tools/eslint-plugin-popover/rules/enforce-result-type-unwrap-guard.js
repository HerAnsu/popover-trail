/**
 * @fileoverview Recommend checking isSuccess or ok before accessing Result data.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage checking result.ok or result.isSuccess before accessing result.data.',
      category: 'Type Safety',
      recommended: false,
    },
    schema: [],
    messages: {
      suggestResultGuard: 'Consider checking result.ok or isSuccess before accessing unwrapped data.',
    },
  },
  create(_context) {
    return {
      MemberExpression(_node) {
        // Result unwrap guideline
      },
    };
  },
};
