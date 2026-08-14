/**
 * @fileoverview Recommend single boolean expression return in custom type guards for readability.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage clean single boolean return in small type guards.',
      category: 'Clean Code',
      recommended: false,
    },
    schema: [],
    messages: {
      simplifyTypeGuard: 'Consider simplifying type guard into a single return expression.',
    },
  },
  create(_context) {
    return {
      FunctionDeclaration(_node) {
        // Clean type guard guideline
      },
    };
  },
};
