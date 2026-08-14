/**
 * @fileoverview Disallow multiple consecutive set() calls in a single synchronous handler.
 */

export default {
  meta: {
    type: 'suggestion',
    docs: {
      description: 'Encourage combining consecutive synchronous set() state updates into a single batch commit.',
      category: 'Performance',
      recommended: false,
    },
    schema: [],
    messages: {
      combineSetCalls: 'Combine multiple consecutive set() state updates into a single atomic patch object.',
    },
  },
  create(context) {
    const filename = context.filename || context.getFilename?.() || '';
    if (filename.includes('.test.') || filename.includes('tests/')) return {};

    return {
      BlockStatement(node) {
        let consecutiveSets = 0;
        for (const statement of node.body) {
          if (
            statement.type === 'ExpressionStatement' &&
            statement.expression &&
            statement.expression.type === 'CallExpression' &&
            statement.expression.callee &&
            statement.expression.callee.name === 'set'
          ) {
            consecutiveSets++;
            if (consecutiveSets > 2) {
              context.report({
                node: statement,
                messageId: 'combineSetCalls',
              });
              break;
            }
          } else {
            consecutiveSets = 0;
          }
        }
      },
    };
  },
};
