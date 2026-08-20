/**
 * @fileoverview Enforce descriptive error message in invariant assertion calls.
 */

export default {
  meta: {
    type: 'problem',
    docs: {
      description: 'Enforce non-empty error message string in invariant() assertion calls.',
      category: 'Invariants',
      recommended: true,
    },
    schema: [],
    messages: {
      requireInvariantMessage:
        'invariant() assertion must include a descriptive error message string as second argument.',
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
      CallExpression(node) {
        if (
          node.callee &&
          node.callee.name === 'invariant' &&
          (!node.arguments[1] ||
            (node.arguments[1].type === 'Literal' && node.arguments[1].value === ''))
        ) {
          context.report({
            node,
            messageId: 'requireInvariantMessage',
          });
        }
      },
    };
  },
};
